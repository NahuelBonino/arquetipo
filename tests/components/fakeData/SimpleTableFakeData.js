import { faker } from "@faker-js/faker";
import { getRandomInt } from "../../testUtils";

const id0 = faker.string.alpha(10);
const id1 = faker.string.alpha(10);
const id2 = faker.string.alpha(10);
const id3 = faker.string.alpha(10);

const fakeStaticColumns = [
  {
    id: id0,
    label: faker.string.alpha(10),
  },
  {
    id: id1,
    label: faker.string.alpha(10),
  },
  {
    id: id2,
    label: faker.string.alpha(10),
  },
  {
    id: id3,
    label: faker.string.alpha(10),
  },
];

const options = [10, 25, 50];
const randomOptionsIndex = getRandomInt(3);

const fakeRowsPerPage = options[randomOptionsIndex];
const fakeTotal = faker.number.int(14) + 1;
const fakePage = 0;

let fakeItems = new Array();

for (let i = 0; i < fakeTotal; i++) {
  let fkitems = new Map();
  fkitems.set(id0, faker.string.alpha(10));
  fkitems.set(id1, faker.string.alpha(10));
  fkitems.set(id2, faker.string.alpha(10));
  fkitems.set(id3, faker.date.anytime());
  fakeItems.push(JSON.parse(JSON.stringify(Object.fromEntries(fkitems))));
}

const defaultProps = {
  staticColumns: fakeStaticColumns,
  items: fakeItems,
  editEnabled: true,
  viewEnabled: true,
  deleteEnabled: true,
  edit: jest.fn(),
  selectForDelete: jest.fn(),
  total: fakeTotal,
  rowsPerPage: fakeRowsPerPage,
  t: (p) => p,
  page: fakePage,
  handleChangePage: jest.fn(),
  handleChangeRowsPerPage: jest.fn(),
  handleOrderBy: jest.fn(),
  orderDirection: "asc",
  historyEnabled: true,
};

const defaultPropsWithEditLink = {
  staticColumns: fakeStaticColumns,
  items: fakeItems,
  editEnabled: true,
  editLink: faker.internet.url(),
  viewEnabled: true,
  deleteEnabled: true,
  edit: jest.fn(),
  selectForDelete: jest.fn(),
  total: fakeTotal,
  rowsPerPage: fakeRowsPerPage,
  t: (p) => p,
  page: fakePage,
  handleChangePage: jest.fn(),
  handleChangeRowsPerPage: jest.fn(),
  handleOrderBy: jest.fn(),
  orderDirection: "asc",
};

const actionComponents = [
  {
    label: faker.string.alpha(10),
    createComponent: jest.fn(),
  },
];

export { defaultProps, defaultPropsWithEditLink, fakeStaticColumns, fakeRowsPerPage, fakeTotal, actionComponents }