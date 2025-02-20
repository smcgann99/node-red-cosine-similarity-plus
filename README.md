[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![npm version](https://img.shields.io/npm/v/node-red-cosine-similarity-plus.svg)](https://www.npmjs.com/package/node-red-cosine-similarity-plus)
[![Min Node Version](https://img.shields.io/node/v/node-red-cosine-similarity-plus)](https://www.npmjs.com/package/@smcgann/node-red-annotate-image-plus)
[![GitHub license](https://img.shields.io/github/license/smcgann99/node-red-cosine-similarity-plus)](https://github.com/smcgann99/node-red-cosine-similarity-plus/blob/main/LICENSE)

# @smcgann/node-red-cosine-similarity-plus

A <a href="http://nodered.org" target="_blank">Node-RED</a> node that calculates the cosine similarity, between a set of stored vectors and provided vector values. 

This node is a significantly modified version of 🔗 [@good-i-deer/node-red-contrib-cosine-similarity](https://www.npmjs.com/package/@good-i-deer/node-red-contrib-cosine-similarity) and doesn't maintain compatibility with that node.

---

## **Key Changes**

✔ **input data** - accepts payload direct from 🔗 [@smcgann/node-red-face-vectorization-plus](https://www.npmjs.com/package/@smcgann/node-red-face-vectorization-plus).   
✔ Supports multiple stored vector locations: file, flow context, or global context.   
✔ Stored vectors now also include names and image file data, for meaningful results.       
✔ Returns sorted results, filtered by a configurable similarity threshold.       
✔ Generates an error message if no results meet threshold.         
✔ More robust error handling with validation for missing and invalid data structures.    
✔ Supports runtime configuration through `msg.cosineOptions` for dynamic settings.     
✔ Includes metadata in `msg.cosineConfig` (threshold used, file type, file path).     
✔ **Easier integration** into Node-RED flows.     
     

---

## **Description**

This node calculates cosine similarity between two sets of vectors. One passed in by `msg.payload` and one stored in a file or context variable.
It returns the results in `msg.payload`as an array of objects, where the similarity is above set threshold.

```javascript
input = array[2] // (2 faces)

0: array[0.12, 0.34, 0.56, "..."] // 512 vectors for each face.
1: array[0.11, 0.22, 0.33, "..."]

// Stored as a nested object, with each key representing an individual person.
storedVectors = 
{
  "Adam": {
    "/full-path/Adam/Adam-01.jpg": [0.12, 0.34, 0.56, "..."], // 512 vectors for each face.
    "/full-path/Adam/Adam-03.jpg": [0.23, 0.45, 0.67, "..."],
    "/full-path/Adam/Adam-02.jpg": [0.34, 0.56, 0.78, "..."]
  },
  "Alison": {
    "/full-path/Alison/Alison-01.jpg": [0.11, 0.22, 0.33, "..."],
    "/full-path/Alison/Alison-02.jpg": [0.44, 0.55, 0.66, "..."]
  }
  // repeated for x number of people

}

output = array[2] // (2 matches above threshold)
[
    { "Alison": { "/full-path/Alison/8.jpg": 0.7265643591861766 } },
    { "Peter": { "/full-path/people/Peter/9.jpg": 0.6443388973714721 } }
]
```

---

## **Installation**

Either use the Edit Menu - Manage Palette option to install, or run the following command in your Node-RED user directory - typically `~/.node-red`

```bash
cd ~/.node-red
npm install @smcgann/node-red-cosine-similarity-plus
```

Restart your Node-RED instance

---

## **Input Properties**

### 📌 **msg.payload** → `Array`  

- The input is an array of vector arrays. (created by the vectorize node)
  
### ⚙️ **msg.cosineOptions** → `Object` *(Optional)*  
- Allows overriding node config settings dynamically.  
- Example:  
``` json
{  
  "threshold": 0.4,  
  "fileType":"path",
  "file":"/home/pi/vectortest.txt" 
}  
```
---

## **Node Properties**

<img width="500" alt="Properties" src="https://raw.githubusercontent.com/smcgann99/node-red-cosine-similarity-plus/main/assets/config.png">

### 🏷️ **Name**

- The name of the node displayed on the screen.

### 🎚️ **Threshold**

- Results with a value equal to or above the specified threshold will be returned. Set the threshold to 0 to include all matches.

### 📂 **Vectors**

- File or context path of file or variable, that will be compared with the input vector array. Cannot be empty.

---

## **Output**

### 📌 **msg.payload** → `Array`  

- The output is an array of name objects. Each containing the orginal source image file and percentage similarity to the input vectors.
  
### ⚙️ **msg.cosineConfig** → `Object` 
- The configuration used for the calculations.

---



## ✍️ Authors

**[S.McGann](https://github.com/smcgann99)** → Modified Version.

[**GOOD-I-DEER**](https://github.com/GOOD-I-DEER) in SSAFY(Samsung Software Academy for Youth) 9th

- [Kim Jaea](https://github.com/kimjaea)
- [Yi Jong Min](https://github.com/chickennight)
- [Lee Deok Yong](https://github.com/Gitgloo)
- [Lee Che Lim](https://github.com/leecr1215)
- [Lee Hyo sik](https://github.com/hy06ix)
- [Jung Gyu Sung](https://github.com/ramaking)

---

## 📜 Copyright and license

S.McGann → Modified Version   
Copyright Samsung Automation Studio Team under the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0)

---

## Reference

- [Node-RED Creating Nodes](https://nodered.org/docs/creating-nodes/)
- [SamsungAutomationStudio Github Repository](https://github.com/Samsung/SamsungAutomationStudio)

---
