import React from 'react';
import { redirect } from "@/i18n/navigation";
const Home = () => {
  return redirect({
    href: '/en',
    locale: 'en',
  });
};

export default Home;
