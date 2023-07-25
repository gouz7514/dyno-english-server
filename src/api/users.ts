import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { secretKey, option } from '../config/secretKey'

const getUsers = async (req: Request, res: Response) => {
  const user_id = req.params.userId

  try {
    const result = await req.dbClient.query(
      `SELECT u.id AS user_id, u.name AS user_name, u.phone, u.is_staff, u.kakao_id,
            k.id AS kid_id, k.name AS kid_name, k.birth as kid_birth
      FROM users AS u
      LEFT JOIN kids AS k ON u.id = k.user_id
      WHERE u.id = $1`,
      [user_id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        message: 'NOT_FOUND',
      })
    } else {
      return res.status(200).json({
        status: 200,
        message: 'SUCCESS',
        data: result.rows[0],
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    })
  }
}

const createToken = async (req: Request, res: Response, payload: any) => {
  try {
    const token = jwt.sign(payload, secretKey, option as jwt.SignOptions)
    
    if (token) {
      return token
    } else {
      throw new Error('Failed to create token')
    }
  } catch (error) {
    console.log(error)
  }
}

const createUserAndKid = async (req: Request) => {
  const { name, phone, is_staff, kakao_id } = req.body

  try {
    const createUser = await req.dbClient.query(
      `INSERT INTO users (name, phone, is_staff, kakao_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, phone, is_staff, kakao_id]
    )

    const user = createUser.rows[0]

    const createKid = await req.dbClient.query(
      `INSERT INTO kids (user_id) VALUES ($1) RETURNING *`,
      [user.id]
    )

    const kid = createKid.rows[0]

    return {
      user,
      kid
    }
  } catch (error) {
    console.error(error)
    throw new Error('Failed to create user')
  }
}

const updateUserAndKid = async (req: Request) => {
  const { id, name, phone, kids} = req.body

  try {
    const updateUser = await req.dbClient.query(
      `UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING *`,
      [name, phone, id]
    )

    const user = updateUser.rows[0]

    const updateKid = await req.dbClient.query(
      `UPDATE kids SET name = $1, birth = $2 WHERE user_id = $3 RETURNING *`,
      [kids.name, new Date(), id]
    )

    const kid = updateKid.rows[0]

    return {
      user,
      kid
    }
  } catch (error) {
    console.error(error)
    throw new Error('Failed to update user')
  }
}

const postUsers = async (req: Request, res: Response) => {
  const { name, phone, is_staff, kakao_id } = req.body
  try {
    // before create user, check if user already exists
    const isExist = await req.dbClient.query(
      `SELECT * FROM users WHERE kakao_id = $1`,
      [kakao_id]
    )

    const payload = {
      name,
      phone,
      is_staff,
      kakao_id,
      id: null
    }

    // user already exists
    if (isExist.rowCount > 0) {
      const { is_staff, id: user_id } = isExist.rows[0]
      payload.is_staff = is_staff
      payload.id = user_id

      const token = await createToken(req, res, payload)

      return res.status(200).json({
        status: 200,
        message: 'SUCCESS',
        result: {
          token,
          is_staff
        }
      })
    } else {
      const { user, kid } = await createUserAndKid(req)

      payload.id = user.id

      if (user) {
        const token = await createToken(req, res, payload)

        return res.status(201).json({
          status: 201,
          message: 'CREATED',
          result: {
            token,
            is_staff: false
          }
        })
      } else {
        throw new Error('Failed to create user')
      }
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    })
  }
}

const patchUsers = async (req: Request, res: Response) => {
  try {
    const { user, kid } = await updateUserAndKid(req)

    if (user) {
      return res.status(200).json({
        status: 200,
        message: 'SUCCESS',
        data: {
          user,
          kid: {
            name: kid.name,
            birth: kid.birth
          }
        }
      })
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    })
  }

  return res.status(200).json({
    status: 200,
    message: 'SUCCESS',
  })
}

const getUserByToken = async (req: Request, res: Response) => {
  const headers = req.headers
  const accessToken = headers['token']

  // jwt verify to get user info
  try {
    const decoded = jwt.verify(accessToken as string, secretKey, option)

    if (decoded) {
      return res.status(200).json({
        status: 200,
        message: 'SUCCESS',
        data: decoded,
      })
    } else {
      return res.status(400).json({
        status: 400,
        message: 'BAD_REQUEST',
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(401).json({
      status: 401,
      message: 'UNAUTHORIZED',
    })
  }
}

export { getUsers, postUsers, patchUsers, getUserByToken }