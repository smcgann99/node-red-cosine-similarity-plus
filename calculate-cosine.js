const ERROR_VECTOR_LENGTH_ZERO = -100;
const ERROR_COSINE_SIMILARITY_NAN = -200;
const ERROR_FILE_PARSING = -500;
const ERROR_VARIABLE_NOT_FOUND = -300;
const ERROR_VARIABLE_NOT_ARRAY = -400;

module.exports = function (RED) {
  function CalculateCosine(config) {
    RED.nodes.createNode(this, config);

    function calculateSimilarityForVectors(inputVectors, storedVectors) {
      const results = {};

      for (const personName in storedVectors) {
        if (storedVectors.hasOwnProperty(personName)) {
          results[personName] = {};

          for (const fileName in storedVectors[personName]) {
            if (storedVectors[personName].hasOwnProperty(fileName)) {
              const storedVector = storedVectors[personName][fileName];

              results[personName][fileName] = inputVectors.map(inputVector => {
                const result = cosineSimilarity(inputVector, storedVector);
                if (result === ERROR_VECTOR_LENGTH_ZERO || result === ERROR_COSINE_SIMILARITY_NAN) {
                  return result; // Return error code directly for that pair
                }
                return result;
              })[0]; // Directly assign the first (and only) value
            }
          }
        }
      }

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

    async function getStoredVector() {
      const fs = require("fs");
      const fileType = config.fileType;
      const filePath = config.file;

      if (fileType === "path") {
        try {
          const data = await fs.promises.readFile(filePath, "utf8");
          return JSON.parse(data);
        } catch (err) {
          return ERROR_FILE_PARSING;
        }
      } else if (fileType === "flow") {
        const storedVector = this.context().flow.get(filePath);
        if (!storedVector) return ERROR_VARIABLE_NOT_FOUND;
        if (typeof storedVector !== 'object' || Array.isArray(storedVector)) return ERROR_VARIABLE_NOT_ARRAY;
        return storedVector;
      } else if (fileType === "global") {
        const storedVector = this.context().global.get(filePath);
        if (!storedVector) return ERROR_VARIABLE_NOT_FOUND;
        if (typeof storedVector !== 'object' || Array.isArray(storedVector)) return ERROR_VARIABLE_NOT_ARRAY;
        return storedVector;
      }
    }

    this.on("input", async function (msg) {
      let inputVectors = msg.payload; // Assume this is an array of vectors
      let storedVectors = await getStoredVector.call(this);

      if (!Array.isArray(inputVectors) || inputVectors.length === 0) {
        this.error("Input vectors are not valid.");
      } else if (storedVectors === ERROR_FILE_PARSING) {
        this.error("Stored vectors are not valid. Error occurred while parsing file.");
      } else if (storedVectors === ERROR_VARIABLE_NOT_FOUND) {
        this.error("Stored vectors variable not found.");
      } else if (storedVectors === ERROR_VARIABLE_NOT_ARRAY) {
        this.error("Stored vectors variable is not an array.");
      } else {
        let results = calculateSimilarityForVectors(inputVectors, storedVectors);
        // Check for any error codes in the results
        if (Object.values(results).some(person => Object.values(person).some(value => value === ERROR_VECTOR_LENGTH_ZERO))) {
          this.error("The vector length is 0, cannot calculate.", "Error");
        } else if (Object.values(results).some(person => Object.values(person).some(value => value === ERROR_COSINE_SIMILARITY_NAN))) {
          this.error("The cosine similarity is NaN.", "Error");
        } else {
          msg.payload = results;
          this.send(msg);
        }
      }
    });
  }
  RED.nodes.registerType("cosine-similarity-plus", CalculateCosine);
};
