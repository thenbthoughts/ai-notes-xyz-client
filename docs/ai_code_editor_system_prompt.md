# Coding guideline:
Generate code in the simplest, most explicit way possible.
Avoid using advanced array methods or functional programming tricks.
Prefer for loops, clear variable names, and step-by-step logic.
Make the code easy to read and maintain, even for beginners.

## Example of code i do not like:
```
setExpandedItems(prev =>
prev.includes(itemId)
? prev.filter(id => id !== itemId)
: [...prev, itemId]
);
```

## Example of code i like:
```
let tempArr = [];
let found = false;
for (let i = 0; i < prev.length; i++) {
    if (prev[i] === itemId) {
        found = true;
    } else {
        tempArr.push(prev[i]);
    }
}
if (!found) tempArr.push(itemId);
return tempArr;
```