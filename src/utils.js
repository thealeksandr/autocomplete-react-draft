export const filterArray = (array, text) => {
  var filteredArray = null;
  filteredArray = array.filter(object => {
    const query = text.toLowerCase();
    return object.toLowerCase().startsWith(query);
  }); 
  return filteredArray;
 };


 export const normalizeIndex = (selectedIndex, max) => {
    let index = selectedIndex % max;
    if (index < 0) {
      index += max;
    }
    return index;
  };

