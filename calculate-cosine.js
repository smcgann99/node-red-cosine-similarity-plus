const ERROR_VECTOR_LENGTH_ZERO = -100;
const ERROR_COSINE_SIMILARITY_NAN = -200;
const ERROR_FILE_PARSING = -500;
const ERROR_VARIABLE_NOT_FOUND = -300;

function calculateSimilarityForVectors(inputVectors, storedVectors) {
  return inputVectors.map(inputVector => {
    let highestMatch = { personName: null, fileName: null, similarity: -Infinity };

    for (const personName in storedVectors) {
      if (storedVectors.hasOwnProperty(personName)) {
        const personStoredVectors = storedVectors[personName];

        for (const fileName in personStoredVectors) {
          if (personStoredVectors.hasOwnProperty(fileName)) {
            const storedVector = personStoredVectors[fileName];
            const result = cosineSimilarity(inputVector, storedVector);
            if (result > highestMatch.similarity) {
              highestMatch = { personName, fileName, similarity: result };
            }
          }
        }
      }
    }

    if (highestMatch.personName !== null && highestMatch.fileName !== null) {
      return { [highestMatch.personName]: { [highestMatch.fileName]: highestMatch.similarity } };
    } else {
      return {};
    }
  });
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

  if (magnitudeA === 0 || magnitudeB === 0) {
    return ERROR_VECTOR_LENGTH_ZERO;
  }

  const similarity = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  return isNaN(similarity) ? ERROR_COSINE_SIMILARITY_NAN : similarity;
}

async function getStoredVector(fileType, filePath, context) {
  const fs = require("fs");

  if (fileType === "path") {
    try {
      const data = await fs.promises.readFile(filePath, "utf8");
      const parsedData = JSON.parse(data);
      return isValidStoredVector(parsedData) ? parsedData : ERROR_FILE_PARSING;
    } catch (err) {
      return ERROR_FILE_PARSING;
    }
  } else if (fileType === "flow") {
    const storedVector = context.flow.get(filePath);
    return storedVector && isValidStoredVector(storedVector) ? storedVector : ERROR_VARIABLE_NOT_FOUND;
  } else if (fileType === "global") {
    const storedVector = context.global.get(filePath);
    return storedVector && isValidStoredVector(storedVector) ? storedVector : ERROR_VARIABLE_NOT_FOUND;
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

      const fileType = msg.cosineOptions?.fileType || config.fileType;
      const filePath = msg.cosineOptions?.file || config.file;

      let storedVectors = await getStoredVector(fileType, filePath, this.context());

      if (!Array.isArray(inputVectors) || inputVectors.length === 0) {
        this.error("Input vectors are not valid.");
      } else if (storedVectors === ERROR_FILE_PARSING) {
        this.error("Stored vectors are not valid. Error occurred while parsing.");
      } else if (storedVectors === ERROR_VARIABLE_NOT_FOUND) {
        this.error("Stored vectors variable not found.");
      } else {
        const threshold = msg.cosineOptions?.threshold ?? defaultThreshold;

        let results = calculateSimilarityForVectors(inputVectors, storedVectors);
        // Check for any error codes in the results
        if (results.some(personResults => Object.values(personResults).some(person => Object.values(person).some(value => value === ERROR_VECTOR_LENGTH_ZERO)))) {
          this.error("The vector length is 0, cannot calculate.", "Error");
        } else if (results.some(personResults => Object.values(personResults).some(person => Object.values(person).some(value => value === ERROR_COSINE_SIMILARITY_NAN)))) {
          this.error("The cosine similarity is NaN.", "Error");
        } else {
          // Filter results based on threshold and remove empty records
          results = results.map(personResults => {
            const filteredResults = {};
            for (const personName in personResults) {
              const personResult = personResults[personName];
              const filteredPersonResult = {};
              for (const fileName in personResult) {
                if (personResult[fileName] >= threshold) {
                  filteredPersonResult[fileName] = personResult[fileName];
                }
              }
              if (Object.keys(filteredPersonResult).length > 0) {
                filteredResults[personName] = filteredPersonResult;
              }
            }
            return filteredResults;
          });

          // Check if there are any results that meet the threshold
          const hasResults = results.some(personResults => Object.keys(personResults).length > 0);
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