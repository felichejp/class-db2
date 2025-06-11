const queries = [
  {
    name: 'login',
    description: 'Authenticate user with email and password',
    query: `
      SELECT
          u.id,
          u.user,
          u.name,
          u.email,
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
      INSERT INTO users ("user", rol, name, lastname,email) VALUES ($1, $2, $3, $4, $5);
    `
  },
  {
    name: 'create_password',
    description: 'Create a new password',
    query: `
      INSERT INTO passwords (idUser, password) VALUES ($1, crypt($2, gen_salt('des')));
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
    name: 'get_token',
    description: 'Get a token',
    query: `
      SELECT * FROM tokens WHERE idUser = $1;
    `
  }
];

module.exports = queries;
