const usersList = document.getElementById("users-list");

function renderUsers(users: any) {
    if (!usersList) {
        console.log('No users list');

        return;
    }

    usersList.replaceChildren();

    users.forEach((user: any) => {
        const div = document.createElement("div");

        const span = document.createElement("span");
        span.textContent = user.id + ": " + user.name;

        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.addEventListener("click", () => deleteUser(user.id));

        div.appendChild(span);
        div.appendChild(btn);

        usersList.appendChild(div);
    });
}

async function loadUsers() {
    const res = await fetch("/users");
    const users = await res.json();
    renderUsers(users);
}

async function deleteUser(id: string | number) {
    await fetch("/users/" + id, { method: "DELETE" });
    loadUsers();
}

document.getElementById("get-users-btn")?.addEventListener("click", loadUsers);

document.getElementById("create-user-form")?.addEventListener("submit", async (e) =>
    {
        e.preventDefault();

        const input = document.getElementById("user-name") as HTMLInputElement | null;

        if (!input?.value) return;

        await fetch("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: input.value })
        });

        input.value = "";

        await loadUsers();
    });