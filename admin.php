<?php
session_start();

$adminLogin = "d.bochkarev";
$adminPass  = "pL1Rt8YX*=_";
$file = __DIR__ . "/data/applications.csv";
$perPage = 10;

$statusFilter = $_GET['status'] ?? '';

/* ===== АВТОРИЗАЦИЯ ===== */

if (isset($_POST['login'])) {
    if ($_POST['login'] === $adminLogin && $_POST['password'] === $adminPass) {
        $_SESSION['admin'] = true;
        header("Location: admin.php");
        exit;
    } else {
        $error = "Неверный логин или пароль";
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: admin.php");
    exit;
}

if (!isset($_SESSION['admin'])) {
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Вход</title>
<style>
body { font-family:Arial; background:#f4f6f9; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;}
.login-box { background:#fff; padding:30px; width:90%; max-width:350px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.1);}
input { width:100%; padding:12px; margin-bottom:15px; border-radius:6px; border:1px solid #ddd;}
button { width:100%; padding:12px; border:none; background:#2d3436; color:#fff; border-radius:6px;}
.error { color:red; margin-bottom:10px;}
</style>
</head>
<body>
<div class="login-box">
<h3>Админ-панель</h3>
<?php if (!empty($error)) echo "<div class='error'>$error</div>"; ?>
<form method="POST">
<input type="text" name="login" placeholder="Логин" required>
<input type="password" name="password" placeholder="Пароль" required>
<button type="submit">Войти</button>
</form>
</div>
</body>
</html>
<?php
exit;
}

/* ===== ЧТЕНИЕ CSV ===== */

if (!file_exists($file)) die("Нет заявок");

$rowsRaw = [];

if (($handle = fopen($file, "r")) !== false) {
    while (($data = fgetcsv($handle, 0, ";")) !== false) {
        $rowsRaw[] = $data;
    }
    fclose($handle);
}
$rowsRaw[0][0] = preg_replace('/^\xEF\xBB\xBF/', '', $rowsRaw[0][0]);
$headers = array_shift($rowsRaw);

/* ===== ДЕЙСТВИЯ ===== */

if (isset($_POST['save_company'])) {
    $id = (int)$_POST['row_id'];
    $rowsRaw[$id][6] = trim($_POST['company']);
}

if (isset($_GET['read'])) {
    $id = (int)$_GET['read'];
    $rowsRaw[$id][7] = "Прочитано";
}

if (isset($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    unset($rowsRaw[$id]);
}

if (isset($_POST['save_company']) || isset($_GET['read']) || isset($_GET['delete'])) {
    $fp = fopen($file, "w");
    fwrite($fp, "\xEF\xBB\xBF");
    fputcsv($fp, $headers, ";");
    foreach ($rowsRaw as $row) {
        fputcsv($fp, $row, ";");
    }
    fclose($fp);
    header("Location: admin.php");
    exit;
}

/* ===== СОРТИРОВКА ===== */

$indexed = [];
foreach ($rowsRaw as $key => $row) {
    $indexed[] = ['id' => $key, 'data' => $row];
}

if ($statusFilter === "Непрочитано" || $statusFilter === "Прочитано") {
    $indexed = array_filter($indexed, function($row) use ($statusFilter) {
        return $row['data'][7] === $statusFilter;
    });
}

usort($indexed, function($a, $b) {
    return strtotime($b['data'][0]) - strtotime($a['data'][0]);
});

/* ===== ПАГИНАЦИЯ ===== */

$total = count($indexed);
$page = $_GET['page'] ?? 1;
$page = max(1, (int)$page);
$start = ($page - 1) * $perPage;
$rowsPage = array_slice($indexed, $start, $perPage);
$totalPages = ceil($total / $perPage);

?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Админ</title>
<style>
body { font-family:Arial; margin:20px; background:#f4f6f9; }
table { width:100%; border-collapse:collapse; background:#fff; }
th, td { padding:8px; border:1px solid #ddd; text-align:left; }
th { background:#eee; font-weight:bold; }
.unread { background:#fff2f2; }

.company-input {
    width:100%;
    padding:6px;
}

button {
    padding:5px 10px;
    margin-top:4px;
}

.top-bar {
    display:flex;
    justify-content:space-between;
    margin-bottom:15px;
    flex-wrap:wrap;
}

.pagination a {
    margin:0 5px;
    text-decoration:none;
}

.table-wrapper {
    overflow-x:auto;
}

/* Дата */
.date-top {
    font-weight:600;
}
.date-bottom {
    font-size:12px;
    color:#777;
}

/* Ограничение комментария */
.comment-cell {
    max-width:250px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}

/* Модальное окно */
.modal {
    display:none;
    position:fixed;
    z-index:1000;
    left:0;
    top:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    justify-content:center;
    align-items:center;
}

.modal-content {
    background:#fff;
    padding:20px;
    width:90%;
    max-width:500px;
    border-radius:8px;
    max-height:80vh;
    overflow-y:auto;
}

.modal-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:10px;
}

.modal-header button {
    background:none;
    border:none;
    font-size:18px;
    cursor:pointer;
}

#modalText {
    white-space:pre-wrap;
    line-height:1.4;
}
</style>
</head>
<body>

<div class="top-bar">
    <h2>Заявки</h2>
    <div>
        <a href="admin.php?logout=1">Выход</a> |
        <a href="data/applications.csv">Скачать CSV</a>
        
        <form method="GET" style="display:inline-block; margin-left:15px;">
            <select name="status" onchange="this.form.submit()">
                <option value="">Все</option>
                <option value="Непрочитано" <?= $statusFilter=="Непрочитано"?'selected':'' ?>>Непрочитано</option>
                <option value="Прочитано" <?= $statusFilter=="Прочитано"?'selected':'' ?>>Прочитано</option>
            </select>
        </form>

    </div>
</div>

<div class="table-wrapper">
<table>
<tr>
<?php foreach ($headers as $h): ?>
<th><?= htmlspecialchars($h) ?></th>
<?php endforeach; ?>
<th>Действия</th>
</tr>

<?php foreach ($rowsPage as $row): 
$data = $row['data'];
$id = $row['id'];
?>

<tr class="<?= $data[7]=="Непрочитано" ? 'unread' : '' ?>">

<td>
<?php
$parts = explode(" ", $data[0]);
$datePart = $parts[0] ?? '';
$timePart = $parts[1] ?? '';
?>
<div class="date-top"><?= htmlspecialchars($datePart) ?></div>
<div class="date-bottom"><?= htmlspecialchars($timePart) ?></div>
</td>
<td><?= htmlspecialchars($data[1]) ?></td>
<td><?= htmlspecialchars($data[2]) ?></td>
<td><?= htmlspecialchars($data[3]) ?></td>
<td><?= htmlspecialchars($data[4]) ?></td>
<td class="comment-cell"
    onclick="openModal(this)"
    data-comment="<?= htmlspecialchars($data[5], ENT_QUOTES) ?>">

    <?= htmlspecialchars($data[5]) ?>
</td>

<td class="company-cell"
    data-id="<?= $id ?>"
    ondblclick="editCompany(this)">

    <?= !empty($data[6]) 
        ? htmlspecialchars($data[6]) 
        : '<span style="color:#aaa;">—</span>' ?>

</td>

<td><?= htmlspecialchars($data[7]) ?></td>

<td>
<?php if ($data[7]=="Непрочитано"): ?>
<a href="?read=<?= $id ?>"><button>Прочитано</button></a>
<?php endif; ?>
<a href="?delete=<?= $id ?>" onclick="return confirm('Удалить?')">
<button>Удалить</button>
</a>
</td>

</tr>

<?php endforeach; ?>
</table>
</div>

<div class="pagination">
<?php for ($i=1;$i<=$totalPages;$i++): ?>
<a href="?page=<?= $i ?>&status=<?= urlencode($statusFilter) ?>">
    <?= $i ?>
</a>
<?php endfor; ?>
</div>

<div id="commentModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span>Комментарий</span>
            <button onclick="closeModal()">✕</button>
        </div>
        <div id="modalText"></div>
    </div>
</div>

<script>
function editCompany(cell) {

    if (cell.querySelector("input")) return;

    const oldValue = cell.innerText.trim() === "—" ? "" : cell.innerText.trim();
    const id = cell.dataset.id;

    cell.innerHTML = `<input type="text" value="${oldValue}" style="width:100%;padding:4px;">`;

    const input = cell.querySelector("input");
    input.focus();

    input.addEventListener("blur", save);
    input.addEventListener("keydown", function(e){
        if(e.key === "Enter") save();
    });

    function save(){
        fetch("update_company.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}&company=${encodeURIComponent(input.value)}`
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                cell.innerHTML = input.value.trim() !== "" 
                    ? input.value 
                    : '<span style="color:#aaa;">—</span>';
            } else {
                alert("Ошибка сохранения");
            }
        });
    }
}
</script>

<script>
function openModal(cell){
    const text = cell.dataset.comment;
    document.getElementById("modalText").innerText = text;
    document.getElementById("commentModal").style.display = "flex";
}

function closeModal(){
    document.getElementById("commentModal").style.display = "none";
}

window.onclick = function(event){
    const modal = document.getElementById("commentModal");
    if(event.target === modal){
        closeModal();
    }
}
</script>

</body>
</html>