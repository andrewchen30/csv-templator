# CSV-Templator

At-a-glance CSV rendering

## Why

- Exporting CSV programming always needs tons of for-loop or array operations. It’s cumbersome and hard to maintain.
- In the CSV exporting code, render(format) logic, data adjustment logic, and business logic all mix together.

## How

Use csv-templator to handle your rendering and adjustment logics. The output will be visible and predictable

```tsx
const data = {
  users: [
    { name: 'Andrew', age: 30 },
    { name: 'Joanne', age: 28 },
    { name: 'Frank', age: 22 },
  ],
};

const templator = new CSVTemplator(`
  |                           | "name"    | "age"    |
  | % for-row user in users % | user.name | user.age |
`);

const csv = templator.render(data);
```

```
name,age
Andrew,30
Joanne,28
Frank,22
```

## Install

```bash
npm i csv-templator
```

## Concept

- The whole template is config by a markdown table, we manually write the template or copy from a table in Notion.
- We can see two types in the table `Data Cell` and `Logic Cell`. Data Cell is the cell we you render the CSV output. The Logic Cell always start and end with a `%`, we depends on logic cell to arrange data.

Here is an example we used in the previous demo:

|                           | "name"    | "age"    |
| ------------------------- | --------- | -------- |
| % for-row user in users % | user.name | user.age |

And here is the type of each cells:

|              | (Data Cell) | (Data Cell) |
| ------------ | ----------- | ----------- |
| (Logic Cell) | (Data Cell) | (Data Cell) |

## Data Cell

Each cell is treated as a function of an independent force and can read the value of the first level of rendering argument. For example, the cell of `user.name` actually works like the following function. The following function's return will be the CSV cell output.

```tsx
function(data) { // The data you gave during the templator.render(...)
   const {
      users,    // the part of original data
      user,     // inject by for-row
   } = data;

   return user.name // the data cell rendering command

   // We can do some fancy operations here
   // reutrn `My name is: ${user.name}`

   // set default value for empty values
   // return user.name || "unknown user name"

   // or some calcualtions
   // return user.age + 30
}
```

## Logic Cell

- `for-row` and `for-col`
- `visible-row` and `visible-col`

### `for-row` and `for-col`

Arrange an array, the csv-templator renderer will pass the item of an array into the data cell render function. The same example we used in the first demo:

|                           | "name"    | "age"    |
| ------------------------- | --------- | -------- |
| % for-row user in users % | user.name | user.age |

It will work like this:

|                           | "name"        | "age"        |
| ------------------------- | ------------- | ------------ |
| % for-row user in users % | users[0].name | users[0].age |
|                           | users[1].name | users[1].age |
|                           | users[2].name | users[2].age |

### `visible-row` and `visible-col`

Define the row or the column are visible based on a boolean:

```tsx
const data = {
  showAge: false,
  users: [
    { name: 'Andrew', age: 30 },
    { name: 'Joanne', age: 28 },
    { name: 'Frank', age: 22 },
  ],
};

const templator = new CSVTemplator(`
  |                           |           | % visible-col showAge % |
  |                           | "name"    | "age"                   |
  | % for-row user in users % | user.name | user.age                |
`);

const csv = templator.render(data);
// csv:
// "name
// Andrew
// Joanne
// Frank"
```
