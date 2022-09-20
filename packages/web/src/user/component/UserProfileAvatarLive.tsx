import { useUserProfile } from 'user/hook/useUserProfile';

import { UserProfileAvatar, UserProfileAvatarProps } from './UserProfileAvatar';

// live version of the UserProfileAvatar component
// ********************************************************************************
type Props = Omit<UserProfileAvatarProps, 'userProfilePrivate' | 'userPublicProfile'> & {/*nothing else*/};
export const UserProfileAvatarLive: React.FC<Props> = ({ userId, ...props }) => {
  const { userProfile } = useUserProfile(userId);
  if(!userProfile) return null/*no User so nothing to show*/;

  return <UserProfileAvatar userId={userId} userPublicProfile={userProfile} {...props} />;
};
