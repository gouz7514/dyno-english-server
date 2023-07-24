import { Request, Response } from 'express'

const getUsers = async (req: Request, res: Response) => {
  const headers = req.headers
  const userId = headers.id

  try {
    const result = await req.dbClient.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
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

const postUsers = async (req: Request, res: Response) => {
  const { id, name, is_staff, phone, kids } = req.body
  try {
    const result = await req.dbClient.query(
      `INSERT INTO users (id, name, is_staff, phone, kids) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING RETURNING *`,
      [id, name, is_staff, phone, kids]
    )

    if (result.rowCount === 1) {
      return res.status(201).json({
        status: 201,
        message: 'CREATED',
      })
    } else {
      return res.status(200).json({
        status: 200,
        message: 'SUCCESS',
      })
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    })
  }
}

const patchUsers = async (req: Request, res: Response) => {
  const { id, name, phone, kids } = req.body

  try {
    const result = await req.dbClient.query(
      `UPDATE users SET name = $1, phone = $2, kids = $3 WHERE id = $4 RETURNING *`,
      [name, phone, kids, id]
    )

    console.log(result.rowCount)
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

export { getUsers, postUsers, patchUsers }