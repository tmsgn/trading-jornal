const playbooks = [{ id: "123", name: "BNQ" }];
const trade = { playbookId: null };
const playbook = "BNQ";

const pbId = playbook ? (playbooks.find((p) => p.name === playbook)?.id || trade.playbookId) : null;
console.log(pbId);
