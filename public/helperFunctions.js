module.exports.formatDate = function(toDoItem) {
    const day = toDoItem.completeBy.getUTCDate();
    const month = toDoItem.completeBy.getUTCMonth() + 1;
    const year = toDoItem.completeBy.getUTCFullYear();
    return `${year}/${month}/${day}`;
  };
  
 module.exports.sortCategories = function(categoryArray) {
    categoryArray.sort((toDo1, toDo2) => toDo1.completeBy - toDo2.completeBy || toDo1.priority - toDo2.priority);
  }
  
module.exports.defaultDate = function(toDoItem) {
    let day = toDoItem.completeBy.getUTCDate();
    let month = (toDoItem.completeBy.getUTCMonth() + 1);
    const year = toDoItem.completeBy.getUTCFullYear();
    if(month < 10) {
        month = `0${month}`
    }
    if (day < 10) {
        day = `0${day}`
    }
    return `${year}-${month}-${day}`;
  };