'use client';

import React, { createContext } from 'react';

import PropTypes from 'prop-types';

import { useGetUserQuery } from '@/components/common/hooks/use_get_user_query';

const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const { data: data, isLoading } = useGetUserQuery();

  if (data?.error?.statusCode === 401) {
    window.location.href = '/login';
  }

  return <UserContext.Provider value={{ user: data?.user, isLoading }}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserProvider };
export default UserContext;
