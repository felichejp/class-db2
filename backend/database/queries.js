const queries = [
  {
    name: 'login',
    description: 'Authenticate user with username and password',
    query: `
      SELECT
          u.id,
          u.user_name,
          u.name,
          crypt($2, p.password) = p.password AS ispassok
      FROM users u
      INNER JOIN passwords p ON u.id = p.idUser
      WHERE u.email = $1
      ORDER BY p.id DESC
      LIMIT 1
      ;
    `
  },
  {
    name: 'create_user',
    description: 'Create a new user',
    query: `
      INSERT INTO users (user_name, rol, name, lastname) VALUES ($1, $2, $3, $4);
    `
  },
  {
    name: 'create_password',
    description: 'Create a new password',
    query: `
      INSERT INTO passwords (idUser, password) VALUES ($1, $2));
    `
  },
  {
    name: 'create_access_server',
    description: 'Create a new access server',
    query: `  
      INSERT INTO access (idUser, typeAccess, ip) VALUES ($1, $2, $3);
    `
  },
  {
    name: 'create_token',
    description: 'Create a new token',
    query: `
      INSERT INTO tokens (idUser, token, expires) VALUES ($1, $2, $3);
    `
  },
  {
    name: 'find_token',
    description: 'Get a token by token',
    query: `
      SELECT
        *
      FROM user_tokens ut
      WHERE ut.token = $1;
    `
  },
  {
    name: 'create_user_token',
    description: 'Create a new user token',
    query: `
      INSERT INTO
        user_tokens
        (idUser, token, expires)
      VALUES ($1, $2, $3);
    `
  }
];

module.exports = queries;
