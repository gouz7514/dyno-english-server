import { Request, Response } from 'express'

const getTestimonials = async (req: Request, res: Response) => {
  try {
    const result = await req.dbClient.query(
      `SELECT * FROM testimonials`
    )

    if (result.rowCount === 0) {
      return res.status(200).json({
        status: 200,
        message: 'EMPTY',
        data: []
      })
    } else {
      return res.status(200).json({
        status: 200,
        message: 'SUCCESS',
        data: result.rows,
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

// 후기 등록 자주 못하도록 막아야 한다
const postTestimonials = async (req: Request, res: Response) => {
  const { content, author, user_id } = req.body

  // check if userId is valid
  try {
    const result = await req.dbClient.query(
      `SELECT * FROM users WHERE id = $1`,
      [user_id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: 404,
        message: 'NOT_FOUND',
      })
    }
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'UserId valid check error',
    })
  }

  try {
    const result = await req.dbClient.query(
      `INSERT INTO testimonials (content, author, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [content, author, user_id]
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
    console.log(err)
    return res.status(500).json({
      status: 500,
      message: 'Internal server error',
    })
  }
}

export { getTestimonials, postTestimonials }