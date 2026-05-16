<?php
session_start();
require_once 'config.php';

if (isset($_SESSION['userID']) && $_SESSION['user_type'] === 'lecturer') {
    header('Location: dashboard.php'); exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email']    ?? '');
    $password = trim($_POST['password'] ?? '');
    if ($email && $password) {
        $db   = getDB();
        $stmt = $db->prepare("SELECT userID, Name, user_type, course, email, password FROM users WHERE email=? AND user_type='lecturer'");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['userID']    = $user['userID'];
            $_SESSION['Name']      = $user['Name'];
            $_SESSION['user_type'] = $user['user_type'];
            $_SESSION['course']    = $user['course'];
            $_SESSION['email']     = $user['email'];
            header('Location: dashboard.php'); exit;
        } else {
            $error = 'Invalid email or password.';
        }
    } else {
        $error = 'Please fill in both fields.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ResearchDesk — Login</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Poppins',sans-serif;background:linear-gradient(135deg,#1a1a2e 0%,#2F5DD3 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;}
.wrap{width:420px;max-width:95vw;}
.logo{text-align:center;margin-bottom:32px;}
.logo-icon{width:68px;height:68px;background:rgba(255,255,255,.15);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);}
.logo-icon i{font-size:30px;color:#fff;}
.logo h1{font-size:24px;font-weight:700;color:#fff;}
.logo p{font-size:13px;color:rgba(255,255,255,.65);margin-top:4px;}
.card{background:#fff;border-radius:20px;padding:36px 32px;box-shadow:0 32px 80px rgba(0,0,0,.25);}
.card h2{font-size:20px;font-weight:700;color:#1a1a2e;margin-bottom:4px;}
.card>p{font-size:13px;color:#888;margin-bottom:26px;}
.fg{margin-bottom:18px;}
.fg label{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:7px;}
.iw{position:relative;}
.iw i{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#bbb;font-size:14px;}
.fi{width:100%;padding:11px 14px 11px 38px;border:1.5px solid #e4e8f0;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;outline:none;transition:border .2s;}
.fi:focus{border-color:#2F5DD3;}
.err{background:#FEE2E2;border:1px solid #fca5a5;border-radius:10px;padding:11px 14px;font-size:13px;color:#DC2626;margin-bottom:18px;display:flex;align-items:center;gap:8px;}
.btn{width:100%;padding:13px;background:linear-gradient(135deg,#2F5DD3,#4B7BF5);color:#fff;border:none;border-radius:10px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .2s;margin-top:4px;}
.btn:hover{opacity:.9;}
.demo{margin-top:20px;background:#F0F3FA;border-radius:10px;padding:12px 16px;font-size:12px;color:#555;}
.demo strong{display:block;margin-bottom:4px;color:#2F5DD3;font-size:12px;}
.foot{text-align:center;margin-top:18px;font-size:12px;color:rgba(255,255,255,.5);}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">
    <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
    <h1>ResearchDesk</h1>
    <p>Lecturer Portal</p>
  </div>
  <div class="card">
    <h2>Welcome back 👋</h2>
    <p>Sign in to your lecturer account</p>
    <?php if ($error): ?>
    <div class="err"><i class="fa-solid fa-circle-exclamation"></i><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <form method="POST" autocomplete="on">
      <div class="fg">
        <label>Email Address</label>
        <div class="iw"><i class="fa-regular fa-envelope"></i>
          <input type="email" name="email" class="fi" placeholder="lecturer@university.lk" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
        </div>
      </div>
      <div class="fg">
        <label>Password</label>
        <div class="iw"><i class="fa-solid fa-lock"></i>
          <input type="password" name="password" class="fi" placeholder="••••••••" required>
        </div>
      </div>
      <button type="submit" class="btn"><i class="fa-solid fa-right-to-bracket" style="margin-right:8px;"></i>Sign In</button>
    </form>
    <div class="demo">
      <strong><i class="fa-solid fa-circle-info" style="margin-right:5px;"></i>Demo Credentials</strong>
      Email: kumara@gmail.com &nbsp;|&nbsp; Password: set via DB hash
    </div>
  </div>
  <div class="foot">ResearchDesk &copy; <?= date('Y') ?> — Lecturer Module</div>
</div>
</body>
</html>