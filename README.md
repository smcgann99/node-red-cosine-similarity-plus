# @smcgann99/node-red-cosine-similarity-plus

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![npm version](https://badge.fury.io/js/@good-i-deer%2Fnode-red-contrib-cosine-similarity.svg)](https://badge.fury.io/js/@good-i-deer%2Fnode-red-contrib-cosine-similarity)
[![GitHub license](https://img.shields.io/github/license/GOOD-I-DEER/node-red-contrib-cosine-similarity)](https://github.com/GOOD-I-DEER/node-red-contrib-cosine-similarity/blob/main/LICENSE)

This module provides a node that calculates cosine similarity of two vector values in Node-RED.

This node requires node.js version 18.16.1 and Node-RED version 3.1.0.

<hr>

## Description
This node calculates cosine similarity between two arrays of vectors. One passed in by msg.payload and one stored in a file or context.
It returns the similarity as an array of arrays. This output can be used for detecting if there are cases where the similarity is above a certain value.


```javascript
 input = array[2] // (2 faces)

 0: array[512] // 512 elements for each face.
 1: array[512]

 stored = array[6] // number of face images stored.

 0: array[512]
 1: array[512]
 2: array[512]
 3: array[512]
 4: array[512]
 5: array[512]

 output payload: array[2] 

 0: array[6] // similarity between each input face and each stored face.
 1: array[6]
```

<hr>

## Pre-requisites

node-red-cosine-similarity-plus requires [Node-RED](https://nodered.org) to be installed.

<hr>

## Install

```
cd ~/.node-red
npm install @smcgann/node-red-cosine-similarity-plus
```

Restart your Node-RED instance

<hr>

## Input

Array of Vector Arrays

- The input is an array of vector arrays. (created by the vectorize node) 

<hr>

## property

![cosine-similarity-pic](https://github.com/smcgann99/node-red-cosine-similarity-plus/blob/main/assets/node-config.png)

Name

- The name of the node displayed on the screen.

Vectors

- File or context path of file or variable, that contains another array of vector arrays. This will be compared with the input vector array. Can not be empty.

<hr>

## Output

Array of Cosine Similarity Arrays

- The output is an array of cosine similarity arrays. Each cosine similarity array is similarity between vector of input and vectors of file / variable.

<hr>

## Examples

Here are some example flows of cosine similarity.
![example](https://github.com/smcgann99/node-red-cosine-similarity-plus/assets/57957086/d3150e3f-5d84-440d-80d4-5449125f2271)

### JSON

```
[
    {
        "id": "02168a0656dc6f37",
        "type": "tab",
        "label": "Example Flow",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "0e57c1a384a6551d",
        "type": "calculate-cosine",
        "z": "02168a0656dc6f37",
        "name": "",
        "file": "C:\\Users\\SSAFY\\Desktop\\ssdc\\object\\vectors\\stored.txt",
        "x": 350,
        "y": 80,
        "wires": [
            [
                "71c649b78711fc2a"
            ]
        ]
    },
    {
        "id": "a1704726f1bf888d",
        "type": "function",
        "z": "02168a0656dc6f37",
        "name": "temp function1",
        "func": "msg.payload = msg.payload[0];\nreturn msg",
        "outputs": 1,
        "timeout": 0,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 120,
        "y": 80,
        "wires": [
            [
                "0e57c1a384a6551d"
            ]
        ]
    },
    {
        "id": "71c649b78711fc2a",
        "type": "debug",
        "z": "02168a0656dc6f37",
        "name": "Similarity Value",
        "active": false,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 570,
        "y": 80,
        "wires": []
    }
]
```

<hr>

## Author Modified Version

- [S.McGann](https://github.com/smcgann99)


## Original Authors

[**GOOD-I-DEER**](https://github.com/GOOD-I-DEER) in SSAFY(Samsung Software Academy for Youth) 9th

- [Kim Jaea](https://github.com/kimjaea)
- [Yi Jong Min](https://github.com/chickennight)
- [Lee Deok Yong](https://github.com/Gitgloo)
- [Lee Che Lim](https://github.com/leecr1215)
- [Lee Hyo Sik](https://github.com/hy06ix)
- [Jung Gyu Sung](https://github.com/ramaking)

<hr>

## Copyright and license

Copyright S.McGann 2025 (Modified Version)
Copyright Samsung Automation Studio Team under the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0)

<hr>

## Reference

- [Node-RED Creating Nodes](https://nodered.org/docs/creating-nodes/)
- [SamsungAutomationStudio Github Repository](https://github.com/Samsung/SamsungAutomationStudio)

<hr>
