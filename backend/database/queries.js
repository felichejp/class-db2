const queries = [
  {
    name: 'login',
    description: 'Authenticate user with email and password',
    query: `
      SELECT
    u.id,
    u.email,
    u.name,
    u.lastname,
    u.username,
    crypt($2, p.password) = p.password AS ispassok
    FROM users u
    INNER JOIN passwords p ON u.id = p.idUser
    WHERE u.email = $1
    ORDER BY p.id DESC
    LIMIT 1;
    `
  },
  {
    name: 'create_user',
    description: 'Create a new user',
    query: `
      INSERT INTO users (username, rol, name, lastname, email) VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `
  },
  {
    name: 'create_password',
    description: 'Create a new password',
    query: `
      INSERT INTO passwords (idUser, password) VALUES ($1, crypt($2, gen_salt('bf'))) RETURNING *;
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
    name: 'find_token',
    description: 'Get a token by token',
    query: `
      SELECT
        *
      FROM tokens ut
      WHERE ut.token = $1;
    `
  },
  {
    name: 'create_user_token',
    description: 'Create a new user token',
    query: `
      INSERT INTO
        tokens
        (idUsers, token, expires)
      VALUES ($1, $2, $3);
    `
  },
  {
    name: 'revoke_token',
    description: 'cambiar a true el campo revoked',
    query: `
      UPDATE tokens
      SET revoked = true
      WHERE token = $1;
    `
  }
];

module.exports = queries;
