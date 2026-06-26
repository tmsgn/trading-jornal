import { updateTradeAction } from "./app/actions/trade";

async function run() {
  try {
    const updated = await updateTradeAction("589d0a95-28bb-4c27-abd0-0d39b586f7b6", { playbookId: "37ddcce1-11af-4798-9488-12229be164b5" });
    console.log("Updated Trade:", updated);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
