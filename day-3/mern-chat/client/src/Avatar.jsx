import React from "react";

const Avatar = ({ userId, username }) => {
  //     const colors = ['bg-teal-200', 'bg-red-200',
  //     'bg-green-200', 'bg-purple-200',
  //     'bg-blue-200', 'bg-yellow-200',
  //     'bg-orange-200', 'bg-pink-200', 'bg-fuchsia-200', 'bg-rose-200'];
  // const userIdBase10 = parseInt(userId.substring(10), 16);
  // const colorIndex = userIdBase10 % colors.length;
  // const color = colors[colorIndex];
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    const randomValue = Math.floor(Math.random() * 128) + 128; // Generate a value in the range [128, 255]
    color += letters[randomValue >> 4]; // Convert to hexadecimal
  }

  return (
    <div
      className={"w-8 h-8 relative rounded-full flex items-center "}
      style={{ backgroundColor: color }}
    >
      <div className="text-center w-full opacity-70">{username[0]}</div>
    </div>
  );
};

export default Avatar;
