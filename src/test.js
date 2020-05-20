const { createPostGraphileSchema, withPostGraphileContext } = require('postgraphile');
const { Pool } = require('pg');
const { graphql } = require ('graphql');
const { mapSchema } = require('@graphql-tools/utils');

describe('postgraphile', () => {
  test('mapping postgraphile schema works', async () => {
    const connectionString = 'postgres://postgres:docker@localhost:5432/postgres';

    const schema = await createPostGraphileSchema(
      connectionString,
      'public'
    );

    const pgPool = new Pool({
      connectionString
    });

    const newSchema = mapSchema(schema, {});

    const result = await withPostGraphileContext(
      {
        pgPool,
      },
      async (context) => await graphql(
        newSchema,
        `
          query locations {
            allCities(orderBy: ID_ASC, first: 10) {
              nodes {
                name
              }
            }
          }
        `,
        null,
        context,
      )
    );

    await pgPool.end();

    expect(result.errors).toBeUndefined();
  });
});
