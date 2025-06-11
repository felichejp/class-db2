const queries = [
  {
    name: 'login',
    description: 'Authenticate user with username and password',
    query: `
      SELECT
          u.idUser,
          u.email,
          u.name,
          crypt($2, p.password) = p.password AS ispassok
      FROM users u
      INNER JOIN passwords p ON u.idUser = p.idUser
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
      INSERT INTO users("user", rol, name, lastname, email) VALUES ($1, $2, $3, $4, $5);
    `
  },
  {
    name: 'get_id_user_created',
    description: 'Obtiene el id del usuario recién creado',
    query: `
      SELECT idUser FROM users WHERE name = $1;
    `
  },
  {
    name: 'create_password',
    description: 'Create a new password',
    query: `
      INSERT INTO passwords (idUser, password, countFail) VALUES ($1, crypt($2, gen_salt('md5')), $3);
    `
  },
  {
    name: 'verify_created_password',
    description: 'Verifica que se pudo crear la contraseña del nuevo usuario',
    query: `
      SELECT iduser FROM passwords WHERE iduser = $1;
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
    name: 'create_user_token',
    description: 'Create a new token',
    query: `
      INSERT INTO user_tokens (idUser, token, expires) VALUES ($1, $2, $3);
    `
  },
  {
    name: 'find_token_by_iduser',
    description: 'Get a token by idUSer',
    query: `
      SELECT
        *
      FROM user_tokens ut
      WHERE ut.idUser = $1;
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
  },
  {
    name: 'revoke_token',
    description: 'Revoke token by token',
    query: `
      UPDATE user_tokens ut
      SET revoke = true
      WHERE ut.token = $1;
    `
  }
];

module.exports = queries;
