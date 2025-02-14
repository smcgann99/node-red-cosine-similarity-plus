const ERROR_VECTOR_LENGTH_ZERO = -100;
const ERROR_COSINE_SIMILARITY_NAN = -200;
const ERROR_FILE_PARSING = -500;
const ERROR_VARIABLE_NOT_FOUND = -300;
const ERROR_VARIABLE_NOT_OBJECT = -400;

function calculateSimilarityForVectors(inputVectors, storedVectors) {
  const results = inputVectors.map(inputVector => {
    const personResults = {};

    for (const personName in storedVectors) {
      if (storedVectors.hasOwnProperty(personName)) {
        personResults[personName] = {};

        for (const fileName in storedVectors[personName]) {
          if (storedVectors[personName].hasOwnProperty(fileName)) {
            const storedVector = storedVectors[personName][fileName];
            const result = cosineSimilarity(inputVector, storedVector);
            if (result === ERROR_VECTOR_LENGTH_ZERO || result === ERROR_COSINE_SIMILARITY_NAN) {
              personResults[personName][fileName] = result; // Return error code directly for that pair
            } else {
              personResults[personName][fileName] = result;
            }
          }
        }
      }
    }

    return personResults;
  });

  return results;
}

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return ERROR_VECTOR_LENGTH_ZERO;
  }

  const similarity = dotProduct / (magnitudeA * magnitudeB);
  if (isNaN(similarity)) return ERROR_COSINE_SIMILARITY_NAN;
  return similarity;
}

async function getStoredVector(fileType, filePath, context) {
  const fs = require("fs");

  if (fileType === "path") {
    try {
      const data = await fs.promises.readFile(filePath, "utf8");
      let validate = JSON.parse(data);
      if (!isValidStoredVector(validate)) return ERROR_FILE_PARSING;
      return validate;
    } catch (err) {
      return ERROR_FILE_PARSING;
    }
  } else if (fileType === "flow") {
    const storedVector = context.flow.get(filePath);
    if (!storedVector) return ERROR_VARIABLE_NOT_FOUND;
    if (!isValidStoredVector(storedVector)) return ERROR_FILE_PARSING;
    return storedVector;
  } else if (fileType === "global") {
    const storedVector = context.global.get(filePath);
    if (!storedVector) return ERROR_VARIABLE_NOT_FOUND;
    if (!isValidStoredVector(storedVector)) return ERROR_FILE_PARSING;
    return storedVector;
  }
}

function isValidStoredVector(storedVector) {
  if (typeof storedVector !== 'object' || Array.isArray(storedVector)) return false;
  for (const personName in storedVector) {
    if (storedVector.hasOwnProperty(personName)) {
      if (typeof storedVector[personName] !== 'object' || Array.isArray(storedVector[personName])) return false;
      for (const fileName in storedVector[personName]) {
        if (storedVector[personName].hasOwnProperty(fileName)) {
          if (!Array.isArray(storedVector[personName][fileName])) return false;
        }
      }
    }
  }
  return true;
}

module.exports = function (RED) {
  function CalculateCosine(config) {
    RED.nodes.createNode(this, config);
    const defaultThreshold = config.threshold || 0;

    this.on("input", async function (msg) {
      let inputVectors = msg.payload; // Assume this is an array of vectors

      const fileType = msg.cosineOptions && typeof msg.cosineOptions.fileType === 'string' && ['path', 'flow', 'global'].includes(msg.cosineOptions.fileType)
        ? msg.cosineOptions.fileType
        : config.fileType;

      const filePath = msg.cosineOptions && typeof msg.cosineOptions.file === 'string'
        ? msg.cosineOptions.file
        : config.file;

      let storedVectors = await getStoredVector(fileType, filePath, this.context());

      if (!Array.isArray(inputVectors) || inputVectors.length === 0) {
        this.error("Input vectors are not valid.");
      } else if (storedVectors === ERROR_FILE_PARSING) {
        this.error("Stored vectors are not valid. Error occurred while parsing.");
      } else if (storedVectors === ERROR_VARIABLE_NOT_FOUND) {
        this.error("Stored vectors variable not found.");
      } else {
        const threshold = msg.cosineOptions && !isNaN(msg.cosineOptions.threshold) && msg.cosineOptions.threshold >= 0 && msg.cosineOptions.threshold <= 1 && msg.cosineOptions.threshold !== ""
          ? msg.cosineOptions.threshold
          : defaultThreshold;

        let results = calculateSimilarityForVectors(inputVectors, storedVectors, threshold);
        // Check for any error codes in the results
        if (results.some(personResults => Object.values(personResults).some(person => Object.values(person).some(value => value === ERROR_VECTOR_LENGTH_ZERO)))) {
          this.error("The vector length is 0, cannot calculate.", "Error");
        } else if (results.some(personResults => Object.values(personResults).some(person => Object.values(person).some(value => value === ERROR_COSINE_SIMILARITY_NAN)))) {
          this.error("The cosine similarity is NaN.", "Error");
        } else {
          // Filter results based on threshold
          results = results.map(personResults => {
            const filteredResults = {};
            for (const personName in personResults) {
              filteredResults[personName] = {};
              for (const fileName in personResults[personName]) {
                if (personResults[personName][fileName] >= threshold) {
                  filteredResults[personName][fileName] = personResults[personName][fileName];
                }
              }
            }
            return filteredResults;
          });

          // Check if there are any results that meet the threshold
          const hasResults = results.some(personResults => Object.keys(personResults).length > 0 && Object.values(personResults).some(person => Object.keys(person).length > 0));
          if (!hasResults) {
            this.error("No results - Try a lower threshold");
          } else {
            msg.payload = results;
            msg.cosineConfig = {
              threshold: Number(threshold),
              fileType: fileType,
              file: filePath
            };
            this.send(msg);
          }
        }
      }
    });
  }
  RED.nodes.registerType("cosine-similarity-plus", CalculateCosine);
};