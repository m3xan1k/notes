

let trimDetails = (string) => {
    let words = string.split(' ');
    let newString = words.slice(0, 4).join().replace(',', ' ');
    return newString;
};
