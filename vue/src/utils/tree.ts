  // 获取树结构
  export function treeData(source:any, id:any, parentId:any, children:any, childDefault:any) {  
    let cloneData = JSON.parse(JSON.stringify(source));
    return cloneData.filter((father:any)=>{
        let branchArr = cloneData.filter((child:any) => father[id] == child[parentId]);
        branchArr.length>0 ? father[children] = branchArr : childDefault ? father[children] = childDefault : '';
        return father[parentId] == 0;
    })
  }

  // 查询节点
  export function findNode(tree:any, func:any) {
    for (const node of tree) {
      if (func(node)) return node
      if (node.children) {
        const res:any = findNode(node.children, func)
        if (res) return res
      }
    }
    return null
  }

  // 获取树父节点
  export function parentId(tree:any, id:any, key:any) {
    let arr:any = []
    for (let i = 0; i < tree.length; i++) {
      let item = tree[i]
      arr = []
      arr.push(item[key])
      if (id == item[key]) {
        return arr 
      } else { 
        if (item.children && item.children.length > 0) {
          arr = arr.concat(parentId(item.children, id, key)) 
          if (arr.includes(id)) {
            return arr
          }
        }
      }
    }
  }

  // 获取树父节点nodes
  export function parentNodes(tree:any, id:any, key:any) {
    for(let i in tree) {
      if(tree[i][key] === id) {
        return [tree[i]].filter(v => v[key] == id)
      }
      if(tree[i].children?.length > 0) {
        let node:any = parentNodes(tree[i].children, id, key)
        if(node) return node.concat(tree[i]).filter((v:any) => v[key] !== id)
      }
    }
  }

  // 获取树子节点
  export function childrenId(tree:any, id:any, key:any, arr:any=[]) {
    for(let i in tree) {
      if(tree[i][key] === id) {
        arr.push(tree[i][key] )
        if(tree[i].children?.length > 0) {
          child(tree[i].children, arr, key)
        }
      }else {
        if(tree[i].children?.length > 0) {
          childrenId(tree[i].children, id, key, arr)
        }
      }
    }
    return arr
  }

  // 获取树子节点nodes
  export function childrenNodes(tree:any, id:any, key:any, arr:any=[]) {
    for(let i in tree) {
      if(tree[i][key] === id) {
        arr.push(tree[i])
        if(tree[i].children?.length > 0) {
          child(tree[i].children, arr, '')
        }
      }else {
        if(tree[i].children?.length > 0) {
          childrenNodes(tree[i].children, id, key, arr)
        }
      }
    }
    return arr.filter((v:any) => v[key] !== id)
  }

  // 辅助
  export function child(tree:any, arr:any, key:any) {
    tree.forEach((v:any) => {
      if(key){
        arr.push(v[key]) 
        if(v.children) {
          child(v.children, arr, key)
        }
      }else{
        arr.push(v)
        if(v.children) {
          child(v.children, arr, key)
        }
      }
    })
  }
  
  // 重造树
  export function resetTreeData (data:any, id:any, parent_id:any) {
    let tempArr:any = []
    data.forEach((item:any,index:any) => {
      if(item){
        item.forEach((v:any,i:any) => {
          if (index == 2 && v.parent_id == '0') return
          let temp = Object.assign({}, v)
          if(index == 0){
            temp[id] = '_v' + v.voltage
            temp[parent_id] = '0'
          }
          if(index == 1){
            temp[id] = '_b' + v.bayNum
            temp[parent_id] = '_v' + v.voltage
            temp.name = v.bayName
          }
          if(index == 2){
            temp[parent_id] = '_b' + v.bayNum
          }
          tempArr.push(temp)
        })
      }
    })
    return tempArr
  }

  export const tree = (app:any) => {
    app.config.globalProperties.treeData = treeData;
    app.config.globalProperties.findNode = findNode;
    app.config.globalProperties.parentId = parentId;
    app.config.globalProperties.parentNodes = parentNodes;
    app.config.globalProperties.childrenId = childrenId;
    app.config.globalProperties.childrenNodes = childrenNodes;
    app.config.globalProperties.child = child;
    app.config.globalProperties.resetTreeData = resetTreeData;
  }


