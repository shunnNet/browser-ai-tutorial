const LoginForm = () => {
  return (
    <form>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" className="form-control" />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" className="form-control" />
      </div>
      <button type="submit" className="btn btn-primary">
        Login
      </button>
    </form>
  )
}

export default LoginForm
