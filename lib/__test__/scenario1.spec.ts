import * as fs from 'fs';
import * as _ from 'lodash';
import CSVTemplator from '@/index';

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/scenario1.json`).toString(),
);

describe('scenario 1', () => {
  const successCases: {
    desc: string;
    template: string;
    getData: () => any;
  }[] = [
    {
      desc: 'should successfully render list',
      template: `
      | "Date:" + (new Date()).toLocaleString() |        |         | 
      |                       | "name"                   | "email" |
      | // for-row u in users | u.firstName + u.lastName | u.email |
      
    `,
      getData: () => ({
        users,
      }),
    },
    {
      desc: 'should successfully render list',
      template: `
      |                        | "City Name" | "totalUser" | "Zip Codes"
      | // for-row c in cities | c.name      | c.totalUser | c.zipCodes.join(' / ')
      
    `,
      getData: () => ({
        cities: Object.entries(_.groupBy(users, 'city'))
          .map(([name, users]) => ({
            name,
            totalUser: users.length,
            zipCodes: _.map(users, 'zip'),
          }))
          .sort((a, b) => b.totalUser - a.totalUser),
      }),
    },
    {
      desc: 'should successfully render list',
      template: `
      |                        |             | // for-col domain in mailDomains          |
      |                        | "City Name" | domain                                    | 
      | // for-row c in cities | c.name      | c.groupedByDomain[domain] ? c.groupedByDomain[domain].length : '-'  | 
      
    `,
      getData: () => {
        const getDomain = (email: string) => email.split('@')[1];
        const mailDomains = _.uniq(users.map((u) => getDomain(u.email)));
        const cities = Object.entries(_.groupBy(users, 'city')).map(
          ([name, users]) => ({
            name,
            users,
            groupedByDomain: _.groupBy(users, (u) => getDomain(u.email)),
          }),
        );

        return {
          mailDomains,
          cities,
        };
      },
    },
  ];

  it.each(successCases)('$desc', ({ template, getData }) => {
    const templator = new CSVTemplator(template);

    expect(templator.render(getData())).toMatchSnapshot();
  });
});
