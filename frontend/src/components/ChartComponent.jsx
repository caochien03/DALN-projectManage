import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
function ChartComponent({ project }) {
  if (!project) return null;

  const data = [
    { name: "Start", value: 0 },
    { name: "Progress", value: project.progress || 50 }, // fallback nếu không có progress
    { name: "End", value: 100 },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Biểu đồ tiến độ: {project.name}
      </h3>
      <LineChart width={400} height={200} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
  
}
export default ChartComponent;

