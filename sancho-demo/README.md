# Sancho-mini · Run in browser

The demo is **integrated in the CV**: run `npm run dev` and scroll to the **Sancho-mini** section (or use the "Sancho" link in the nav). This folder only holds the model and vocab assets.

Minimal demo to run the **sancho-mini** ONNX model in the browser with JavaScript (no server, no new deps: uses ONNX Runtime Web via CDN).

## What you need

1. **`sancho-mini.onnx`** – model exported from your Colab notebook.
2. **`vocab.json`** – same vocabulary the model was trained with (character-level).

Place both files in this folder (`noel-cv/public/sancho-demo/`).

## Export ONNX from Colab

Use a wrapper so the model has a single-tensor output (ONNX export does not handle `(logits, loss)` well):

```python
import torch
import json

class GPTExportWrapper(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, idx):
        logits, _ = self.model(idx)
        return logits

export_model = GPTExportWrapper(model)
export_model.eval()

dummy_input = torch.randint(0, vocab_size, (1, 1), dtype=torch.long)

torch.onnx.export(
    export_model,
    dummy_input,
    "sancho-mini.onnx",
    export_params=True,
    opset_version=18,
    do_constant_folding=True,
    input_names=["input_ids"],
    output_names=["logits"],
    dynamic_axes={
        "input_ids": {0: "batch_size", 1: "sequence_length"},
        "logits": {0: "batch_size", 1: "sequence_length"},
    },
)
```

## Export vocab from Colab

JSON keys must be strings. Export after building `stoi` and `itos`:

```python
vocab_export = {
    "itos": {str(i): ch for i, ch in itos.items()},
    "stoi": stoi,
    "startToken": "<|startofpoem|>",
}
with open("vocab.json", "w", encoding="utf-8") as f:
    json.dump(vocab_export, f, ensure_ascii=False)
```

Download `sancho-mini.onnx` and `vocab.json` and put them in `noel-cv/public/sancho-demo/`.

## Run the demo

From the project root:

```bash
cd noel-cv && npm run dev
```

Open **http://localhost:5173**, then scroll to the **Sancho-mini** section or click **Sancho** in the navigation.

Click **Generate poem** to run inference in the browser.
