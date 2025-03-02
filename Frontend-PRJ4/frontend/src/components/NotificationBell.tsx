import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@clerk/clerk-react'

const NotificationBell = () => {
  const { user } = useUser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;  

      try {
        const response = await fetch('/api/subscription/notifications?userId=' + user?.id);
        if (response.ok) {
          const notifications = await response.json();
          setCount(notifications.length); // Opdater antallet af notifikationer
        } else {
          console.error('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <div className="relative flex items-center justify-center">
      <button>
        <Bell className="h-4 w-5 mr-2 text-gray-800 dark:text-gray-200" />
        {count > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 h-4 w-4 text-xs text-white bg-red-600 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;