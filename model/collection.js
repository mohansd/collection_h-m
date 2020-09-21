'use strict';
/**
 * Created by Mohan on 2020/09/21
 * [collections-html2md] collection:
 *
 */

class CollectionNode {
  constructor(isFolder, name, url, parentName, children) {
    this.isFolder = isFolder !== null ? isFolder : true;
    this.name = name;
    this.url = url;
    this.parentName = parentName;
    this.children = children !== null ? children : [];
  }
  addChildren(child) {
    this.children.push(child)
  }
  getMdNode() {
    return !this.isFolder ? `- [${this.name}](${this.url})` :
      `- ${this.name}`
  }
  getSpace(deep) {
    let space = '';
    for(let i = 0; i < deep; i++) {
      space = space + '  '
    }
    return space
  }
}

module.exports = {
  CollectionNode
};
