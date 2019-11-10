
const chunkArray = (array, size) => {
    let newArray = []
    for(let i=0; i<array.length; i+=size) {
        newArray.push(array.slice(i, i+size))
    }
    return newArray
}

export default chunkArray