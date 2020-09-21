'use strict';
/**
 * Created by Mohan on 2020/09/21
 * [collections-html2md] html2md:
 *
 */
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const { CollectionNode } = require('./model/collection');

const html = process.argv.slice(2)[0];
const collection = fs.readFileSync(path.join(__dirname, process.argv.slice(2)[0]));
const $ = cheerio.load(collection);

const getParentName = (node) => {
  if (node.hasOwnProperty('parent') &&
    node.parent.hasOwnProperty('parent') &&
    node.parent.parent.hasOwnProperty('prev') &&
    node.parent.parent.prev.hasOwnProperty('prev')) {
    return node.parent.parent.prev.prev;
  } else {
    return null;
  }
};

const nameFormat = (name) => {
  name = name.replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
    .replace(/【/g, '\\[')
    .replace(/】/g, '\\]')
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/（/g, '(')
    .replace(/）/g, ')');
  return name;
};

const echoMd = (mdContent, node, deep) => {
  const node2md = node.isFolder ?
    `${node.getSpace(deep)}- ${node.name}\n` :
    `${node.getSpace(deep)}- \[${node.name}\]\(${node.url}\)\n`;
  mdContent = mdContent + node2md;
  if (node.children !== null) {
    for(let i = 0; i < node.children.length; i ++) {
      mdContent = echoMd(mdContent, node.children[i], deep + 1);
    }
  }
  return mdContent;
};

const nodeMap = new Map();

Object.values($('A')).forEach((node) => {
  if (node.hasOwnProperty('attribs')) {
    const attribs = JSON.parse(JSON.stringify(node.attribs));
    if (attribs.hasOwnProperty('href')) {
      const url = attribs.href;
      const name = nameFormat(node.children[0].data);
      const parentFolder = getParentName(node);
      let parentName = parentFolder !== null ? nameFormat(parentFolder.children[0].data) : 'undefined';
      if (nodeMap.get(`${name}:collection`) !== null){
        nodeMap.set(`${name}:collection`, new CollectionNode(false, name, url, parentName, null));
      }
    }
  }
});

Object.values($('H3')).forEach((node) => {
  if (node.hasOwnProperty('children')) {
    const name = node.children[0].data;
    const parentFolder = getParentName(node);
    let parentName = parentFolder !== null ? nameFormat(parentFolder.children[0].data) : 'undefined';
    if (nodeMap.get(`${name}:folder`) !== null) {
      nodeMap.set(`${name}:folder`, new CollectionNode(true, name, null, parentName, null));
    }
  }
});

// console.log(nodeMap);
let root = null;
nodeMap.forEach((value) => {
  if (nodeMap.has(`${value.parentName}:folder`)){
    nodeMap.get(`${value.parentName}:folder`).addChildren(value);
  }
  if (value.parentName === 'Bookmarks') {
    root = value
  }
});

// console.log(root);
let mdContent = '';
// console.log(echoMd(mdContent, root, 0));
const md = html.replace('html', 'md');
fs.writeFileSync(path.join(__dirname, md), echoMd(mdContent, root, 0));
