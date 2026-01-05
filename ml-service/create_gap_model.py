import onnx
from onnx import helper, TensorProto
from pathlib import Path

# Inputs
input_tensor = helper.make_tensor_value_info(
    "input", TensorProto.FLOAT, [1, 2]
)

# Output
output_tensor = helper.make_tensor_value_info(
    "output", TensorProto.FLOAT, [1, 1]
)

# Weights: [0.6, 0.4]
weights = helper.make_tensor(
    name="W",
    data_type=TensorProto.FLOAT,
    dims=[2, 1],
    vals=[0.6, 0.4]
)

node = helper.make_node(
    "MatMul",
    inputs=["input", "W"],
    outputs=["output"]
)

graph = helper.make_graph(
    nodes=[node],
    name="gap_model",
    inputs=[input_tensor],
    outputs=[output_tensor],
    initializer=[weights]
)

model = helper.make_model(graph)

out = Path("ml-service/models/gap_model.onnx")
out.parent.mkdir(parents=True, exist_ok=True)
onnx.save(model, out)

print("✅ Valid gap_model.onnx created")
