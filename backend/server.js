const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { Pool } = require("pg")
const { OAuth2Client } = require("google-auth-library")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")

dotenv.config()

console.log("GOOGLE_CLIENT_ID:",process.env.GOOGLE_CLIENT_ID)

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const app = express()
const PORT = process.env.PORT || 5000

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors())
app.use(express.json())


// ==========================================
// POSTGRESQL CONNECTION
// ==========================================

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
})


// Test PostgreSQL connection
pool.connect()
  .then((client) => {
    console.log("PostgreSQL database connected successfully")
    client.release()
  })
  .catch((error) => {
    console.error("PostgreSQL connection failed:")
    console.error(error.message)
  })


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.send("Blogging App backend is running")
})


// ==========================================
// TEST DATABASE
// ==========================================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")

    res.json({
      success: true,
      message: "Database connection is working",
      time: result.rows[0].now,
    })
  } catch (error) {
    console.error("Database test error:", error.message)

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    })
  }
})


// ==========================================
// GET ALL USERS
// ==========================================

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        full_name,
        username,
        email,
        profile_image_url
      FROM users
      ORDER BY id DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    })
  }
})

// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        profile_image_url,
        password,
        two_factor_enabled,
        two_factor_secret
      FROM users
      WHERE email = $1
      `,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    const user = result.rows[0]

    // ==========================================
    // PASSWORD CHECK
    // ==========================================

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    // ==========================================
    // 2FA CHECK
    // ==========================================

    if (user.two_factor_enabled === true) {
      return res.status(200).json({
        requires2FA: true,
        userId: user.id,
        message: "Two-factor authentication code required",
      })
    }

    // ==========================================
    // NORMAL LOGIN
    // ==========================================

    delete user.password
    delete user.two_factor_secret
    delete user.two_factor_enabled

    return res.status(200).json({
      message: "Login successful",
      user,
    })

  } catch (error) {
    console.error("Login error:", error)

    return res.status(500).json({
      message: "Server error during login",
    })
  }
})
// ==========================================
// VERIFY 2FA DURING LOGIN
// ==========================================

app.post("/api/2fa/login-verify", async (req, res) => {
  try {
    const { userId, token } = req.body

    if (!userId || !token) {
      return res.status(400).json({
        message: "User ID and 2FA code are required",
      })
    }

    const cleanToken = String(token)
      .replace(/\D/g, "")
      .slice(0, 6)

    if (cleanToken.length !== 6) {
      return res.status(400).json({
        message: "2FA code must contain 6 digits",
      })
    }

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        profile_image_url,
        password,
        two_factor_secret,
        two_factor_enabled
      FROM users
      WHERE id = $1
      `,
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const user = result.rows[0]

    // Check whether 2FA is enabled
    if (user.two_factor_enabled !== true) {
      return res.status(400).json({
        message: "Two-factor authentication is not enabled",
      })
    }

    // Check whether secret exists
    if (!user.two_factor_secret) {
      return res.status(400).json({
        message: "2FA secret is missing",
      })
    }

    // ==========================================
    // VERIFY AUTHENTICATOR CODE
    // ==========================================

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: cleanToken,
      window: 2,
    })

    if (!verified) {
      return res.status(401).json({
        message: "Invalid 2FA code",
      })
    }

    // ==========================================
    // LOGIN SUCCESSFUL
    // ==========================================

    delete user.password
    delete user.two_factor_secret
    delete user.two_factor_enabled

    return res.status(200).json({
      message: "Login successful",
      user,
    })

  } catch (error) {
    console.error("2FA login verification error:", error)

    return res.status(500).json({
      message: "Unable to verify 2FA",
    })
  }
})

// ==========================================
// GOOGLE LOGIN
// ==========================================

app.post("/api/google-login", async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      })
    }

    // Verify Google credential
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    const googleId = payload.sub
    const email = payload.email
    const fullName = payload.name || "Google User"
    const profileImageUrl = payload.picture || null

    if (!googleId || !email) {
      return res.status(400).json({
        message: "Unable to get Google account information",
      })
    }

    // Check whether this email already exists
    const existingUser = await pool.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        profile_image_url
      FROM users
      WHERE email = $1
      `,
      [email]
    )

    // Existing account
    if (existingUser.rows.length > 0) {
      return res.json({
        message: "Google login successful",
        user: existingUser.rows[0],
      })
    }

    // Create username from Google email
    const baseUsername =
      email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20) || "user"

    let username = baseUsername
    let counter = 1

    // Make username unique
    while (true) {
      const usernameCheck = await pool.query(
        `
        SELECT id
        FROM users
        WHERE username = $1
        `,
        [username]
      )

      if (usernameCheck.rows.length === 0) {
        break
      }

      username = `${baseUsername}${counter}`
      counter++
    }

    // Your current users table requires password
    // and password_hash, so create random values
    // for Google-created accounts.
    const randomPassword =
      `${googleId}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`

    const result = await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        username,
        email,
        password,
        password_hash,
        profile_image_url
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        full_name,
        username,
        email,
        profile_image_url
      `,
      [
        fullName,
        username,
        email,
        randomPassword,
        randomPassword,
        profileImageUrl,
      ]
    )

    return res.status(201).json({
      message: "Google account created successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Google login error:", error)

    return res.status(500).json({
      message: "Google login failed",
      error: error.message,
    })
  }
})

// ==========================================
// SIGNUP
// ==========================================

app.post("/api/signup", async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      password,
      captchaToken,
    } = req.body
    if (
      !full_name ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Full name, username, email and password are required",
      })
    }
    if (!captchaToken) {
  return res.status(400).json({
    message: "Please complete the CAPTCHA",
  })
}

const captchaResponse = await fetch(
  "https://www.google.com/recaptcha/api/siteverify",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: captchaToken,
    }),
  }
)

const captchaData = await captchaResponse.json()

if (!captchaData.success) {
  return res.status(400).json({
    message: "CAPTCHA verification failed. Please try again.",
  })
}

    if (
      !full_name ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Full name, username, email and password are required",
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters",
      })
    }

    // Check email
    const emailCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email.trim()]
    )

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        message:
          "An account with this email already exists",
      })
    }

    // Check username
    const usernameCheck = await pool.query(
      `
      SELECT id
      FROM users
      WHERE username = $1
      `,
      [username.trim()]
    )

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({
        message:
          "This username is already taken",
      })
    }

    // Create user
    const result = await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        username,
        email,
        password,
        password_hash
      )
      VALUES
      ($1, $2, $3, $4, $5)
      RETURNING
        id,
        full_name,
        username,
        email,
        profile_image_url
      `,
      [
        full_name.trim(),
        username.trim(),
        email.trim(),
        password,
        password,
      ]
    )

    res.status(201).json({
      message: "Account created successfully",
      user: result.rows[0],
    })

  } catch (error) {
    console.error("Signup error:", error)

    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    })
  }
})

// ==========================================
// GET ALL POSTS
// ==========================================

app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        posts.id,
        posts.user_id,
        posts.title,
        posts.slug,
        posts.content,
        posts.created_at,
        posts.updated_at,
        users.full_name,
        users.username,
        users.profile_image_url
      FROM posts
      JOIN users
        ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      message: "Failed to get posts",
      error: error.message,
    })
  }
})


// ==========================================
// GET ONE POST
// ==========================================

app.get("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT
        posts.id,
        posts.user_id,
        posts.title,
        posts.slug,
        posts.content,
        posts.created_at,
        posts.updated_at,
        users.full_name,
        users.username,
        users.profile_image_url
      FROM posts
      JOIN users
        ON posts.user_id = users.id
      WHERE posts.id = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      message: "Failed to get post",
      error: error.message,
    })
  }
})


// ==========================================
// CREATE POST
// ==========================================

app.post("/api/posts", async (req, res) => {
  try {
    const {
      user_id,
      title,
      slug,
      content,
    } = req.body

    if (!user_id || !title || !slug || !content) {
      return res.status(400).json({
        message:
          "user_id, title, slug and content are required",
      })
    }

    const result = await pool.query(
      `
      INSERT INTO posts
        (user_id, title, slug, content)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        user_id,
        title,
        slug,
        content,
      ]
    )

    res.status(201).json({
      message: "Post created successfully",
      post: result.rows[0],
    })
  } catch (error) {
    console.error(error.message)

    res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    })
  }
})
// ==========================================
// GET COMMENTS FOR A POST
// ==========================================

app.get(
  "/api/posts/:postId/comments",
  async (req, res) => {
    try {
      const { postId } = req.params

      const result = await pool.query(
        `
        SELECT
          comments.id,
          comments.post_id,
          comments.user_id,
          comments.content,
          comments.created_at,
          users.full_name,
          users.username,
          users.profile_image_url
        FROM comments
        JOIN users
          ON comments.user_id = users.id
        WHERE comments.post_id = $1
        ORDER BY comments.created_at ASC
        `,
        [postId]
      )

      res.json(result.rows)
    } catch (error) {
      console.error(error.message)

      res.status(500).json({
        message: "Failed to get comments",
        error: error.message,
      })
    }
  }
)


// ==========================================
// CREATE COMMENT
// ==========================================

app.post(
  "/api/posts/:postId/comments",
  async (req, res) => {
    try {
      const { postId } = req.params

      const {
        user_id,
        content,
      } = req.body

      if (!user_id || !content) {
        return res.status(400).json({
          message:
            "user_id and content are required",
        })
      }

      const result = await pool.query(
        `
        INSERT INTO comments
          (post_id, user_id, content)
        VALUES
          ($1, $2, $3)
        RETURNING *
        `,
        [
          postId,
          user_id,
          content,
        ]
      )

      res.status(201).json({
        message: "Comment created successfully",
        comment: result.rows[0],
      })
    } catch (error) {
      console.error(error.message)

      res.status(500).json({
        message: "Failed to create comment",
        error: error.message,
      })
    }
  }
)


// ==========================================
// GET LIKES FOR A POST
// ==========================================

app.get(
  "/api/posts/:postId/likes",
  async (req, res) => {
    try {
      const { postId } = req.params
      const userId = req.query.user_id

      const countResult = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM likes
        WHERE post_id = $1
        `,
        [postId]
      )

      let liked = false

      if (userId) {
        const userLike = await pool.query(
          `
          SELECT id
          FROM likes
          WHERE post_id = $1
          AND user_id = $2
          `,
          [postId, userId]
        )

        liked = userLike.rows.length > 0
      }

      res.json({
        likes: Number(
          countResult.rows[0].count
        ),
        liked,
      })
    } catch (error) {
      console.error(error.message)

      res.status(500).json({
        message: "Failed to get likes",
        error: error.message,
      })
    }
  }
)


// ==========================================
// LIKE / UNLIKE A POST
// ==========================================

app.post(
  "/api/posts/:postId/like",
  async (req, res) => {
    try {
      const { postId } = req.params
      const { user_id } = req.body

      if (!user_id) {
        return res.status(400).json({
          message: "user_id is required",
        })
      }

      const existingLike = await pool.query(
        `
        SELECT id
        FROM likes
        WHERE post_id = $1
        AND user_id = $2
        `,
        [postId, user_id]
      )

      if (existingLike.rows.length > 0) {

        await pool.query(
          `
          DELETE FROM likes
          WHERE post_id = $1
          AND user_id = $2
          `,
          [postId, user_id]
        )

        const countResult = await pool.query(
          `
          SELECT COUNT(*) AS count
          FROM likes
          WHERE post_id = $1
          `,
          [postId]
        )

        return res.json({
          liked: false,
          likes: Number(
            countResult.rows[0].count
          ),
        })
      }

      await pool.query(
        `
        INSERT INTO likes
          (post_id, user_id)
        VALUES
          ($1, $2)
        `,
        [postId, user_id]
      )

      const countResult = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM likes
        WHERE post_id = $1
        `,
        [postId]
      )

      res.json({
        liked: true,
        likes: Number(
          countResult.rows[0].count
        ),
      })

    } catch (error) {

      console.error(error.message)

      res.status(500).json({
        message: "Failed to like post",
        error: error.message,
      })

    }
  }
)


// ==========================================
// GET USER PROFILE BY USERNAME
// ==========================================

app.get(
  "/api/users/username/:username",
  async (req, res) => {
    try {
      const { username } = req.params

      const userResult = await pool.query(
        `
        SELECT
          id,
          full_name,
          username,
          email,
          profile_image_url
        FROM users
        WHERE username = $1
        `,
        [username]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        })
      }

      const user = userResult.rows[0]

      const postsResult = await pool.query(
        `
        SELECT
          id,
          user_id,
          title,
          slug,
          content,
          created_at,
          updated_at
        FROM posts
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user.id]
      )

      res.json({
        user,
        posts: postsResult.rows,
      })
    } catch (error) {
      console.error(
        "Profile error:",
        error.message
      )

      res.status(500).json({
        message: "Failed to load profile",
        error: error.message,
      })
    }
  }
)
// ==========================================
// UPDATE POST
// ==========================================

app.put("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params

    const {
      title,
      content,
      user_id,
    } = req.body

    if (!title || !content || !user_id) {
      return res.status(400).json({
        message:
          "Title, content and user_id are required",
      })
    }

    const postResult = await pool.query(
      `
      SELECT id, user_id
      FROM posts
      WHERE id = $1
      `,
      [id]
    )

    if (postResult.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      })
    }

    const post = postResult.rows[0]

    if (
      String(post.user_id) !==
      String(user_id)
    ) {
      return res.status(403).json({
        message:
          "You can only edit your own posts",
      })
    }

    const result = await pool.query(
      `
      UPDATE posts
      SET
        title = $1,
        content = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [
        title.trim(),
        content.trim(),
        id,
      ]
    )

    res.json({
      message: "Post updated successfully",
      post: result.rows[0],
    })

  } catch (error) {

    console.error(
      "Update post error:",
      error
    )

    res.status(500).json({
      message: "Failed to update post",
      error: error.message,
    })

  }
})


// ==========================================
// DELETE POST
// ==========================================

app.delete(
  "/api/posts/:id",
  async (req, res) => {
    try {
      const { id } = req.params
      const { user_id } = req.body

      if (!user_id) {
        return res.status(400).json({
          message: "user_id is required",
        })
      }

      const postResult = await pool.query(
        `
        SELECT id, user_id
        FROM posts
        WHERE id = $1
        `,
        [id]
      )

      if (postResult.rows.length === 0) {
        return res.status(404).json({
          message: "Post not found",
        })
      }

      const post = postResult.rows[0]

      if (
        String(post.user_id) !==
        String(user_id)
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own posts",
        })
      }

      await pool.query(
        `
        DELETE FROM posts
        WHERE id = $1
        `,
        [id]
      )

      res.json({
        message: "Post deleted successfully",
      })

    } catch (error) {

      console.error(
        "Delete post error:",
        error
      )

      res.status(500).json({
        message: "Failed to delete post",
        error: error.message,
      })

    }
  }
)
// ==========================================
// FOLLOW / UNFOLLOW USER
// ==========================================

app.post(
  "/api/users/:userId/follow",
  async (req, res) => {
    try {
      const { userId } = req.params
      const { follower_id } = req.body

      if (!follower_id) {
        return res.status(400).json({
          message: "follower_id is required",
        })
      }

      if (String(userId) === String(follower_id)) {
        return res.status(400).json({
          message: "You cannot follow yourself",
        })
      }

      // Check that the user being followed exists
      const userResult = await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = $1
        `,
        [userId]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        })
      }

      // Check if already following
      const existingFollow = await pool.query(
        `
        SELECT id
        FROM follows
        WHERE follower_id = $1
        AND following_id = $2
        `,
        [follower_id, userId]
      )

      // If already following → unfollow
      if (existingFollow.rows.length > 0) {
        await pool.query(
          `
          DELETE FROM follows
          WHERE follower_id = $1
          AND following_id = $2
          `,
          [follower_id, userId]
        )

        return res.json({
          following: false,
          message: "Unfollowed successfully",
        })
      }

      // Otherwise → follow
      await pool.query(
        `
        INSERT INTO follows
          (follower_id, following_id)
        VALUES
          ($1, $2)
        `,
        [follower_id, userId]
      )

      res.json({
        following: true,
        message: "Followed successfully",
      })

    } catch (error) {
      console.error(
        "Follow error:",
        error
      )

      res.status(500).json({
        message: "Failed to follow user",
        error: error.message,
      })
    }
  }
)


// ==========================================
// GET FOLLOW STATUS
// ==========================================

app.get(
  "/api/users/:userId/follow-status",
  async (req, res) => {
    try {
      const { userId } = req.params
      const { follower_id } = req.query

      if (!follower_id) {
        return res.json({
          following: false,
        })
      }

      const result = await pool.query(
        `
        SELECT id
        FROM follows
        WHERE follower_id = $1
        AND following_id = $2
        `,
        [follower_id, userId]
      )

      res.json({
        following: result.rows.length > 0,
      })

    } catch (error) {
      console.error(
        "Follow status error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to get follow status",
        error: error.message,
      })
    }
  }
)


// ==========================================
// GET FOLLOW COUNTS
// ==========================================

app.get(
  "/api/users/:userId/follow-counts",
  async (req, res) => {
    try {
      const { userId } = req.params

      const followersResult = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM follows
        WHERE following_id = $1
        `,
        [userId]
      )

      const followingResult = await pool.query(
        `
        SELECT COUNT(*) AS count
        FROM follows
        WHERE follower_id = $1
        `,
        [userId]
      )

      res.json({
        followers: Number(
          followersResult.rows[0].count
        ),
        following: Number(
          followingResult.rows[0].count
        ),
      })

    } catch (error) {
      console.error(
        "Follow counts error:",
        error
      )

      res.status(500).json({
        message:
          "Failed to get follow counts",
        error: error.message,
      })
    }
  }
)


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Blogging App backend is running on http://localhost:${PORT}`
  )
})