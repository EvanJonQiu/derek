import { Decimal } from 'decimal.js';

let CompareUp = function(propertyName,type) { // 升序排序
  if (type === 1) { // 属性值为非数字
    return function(object1, object2) {
      let value1 = object1[propertyName];
      let value2 = object2[propertyName];
      return value1.localeCompare(value2);
    }
  }
  else {
    return function(object1, object2) { // 属性值为数字
      let value1 = object1[propertyName];
      let value2 = object2[propertyName];
      return new Decimal(value1).sub(new Decimal(value2)).toNumber();
    }
  }
}

let CompareDown = function (propertyName,type) { // 降序排序
  if (type === 1) { // 属性值为非数字
    return function(object1, object2) {
      let value1 = object1[propertyName];
      let value2 = object2[propertyName];
      return value2.localeCompare(value1);
    }
  }
  else {
    return function(object1, object2) { // 属性值为数字
      let value1 = object1[propertyName];
      let value2 = object2[propertyName];
      return new Decimal(value2).sub(new Decimal(value1)).toNumber();
    }
  }
}

export {CompareUp, CompareDown};