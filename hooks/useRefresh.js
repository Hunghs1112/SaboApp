import { useState } from 'react';
import axios from 'axios';

// Custom hook để handle refreshing và fetch dữ liệu
export default function useRefresh(apiCalls) {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({});

  const reloadData = async () => {
    setRefreshing(true); // Bắt đầu trạng thái loading
    try {
      const results = await Promise.all(
        apiCalls.map((call) => axios.get(call.url))
      );

      // Gán dữ liệu từ kết quả API vào state
      const newData = {};
      apiCalls.forEach((call, index) => {
        newData[call.key] = results[index].data;
      });
      setData(newData);
    } catch (error) {
      console.error("Error reloading data:", error);
    } finally {
      setRefreshing(false); // Kết thúc loading
    }
  };

  return { refreshing, data, reloadData };
}
