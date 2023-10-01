import { useDrag } from "react-dnd";

const UserItem: React.FC<User> = ({ id, username, currentRole }) => {
    const [, ref] = useDrag({
      type: "USER",
      item: { id, currentRole },
    });
  
    return (
      <div ref={ref} style={{ padding: '0.5rem' }}>
        {username}
      </div>
    );
  };
export default UserItem;
