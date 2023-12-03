import { useDrag } from "react-dnd";

const UserItem: React.FC<any> = ({ id, username, currentRole }) => {
    const [, ref] = useDrag({
      type: "USER",
      item: { id, currentRole },
    });
  
    return (
      <div ref={ref} style={{ border: "solid 2px gray", borderRadius: '5px', marginTop: '5px', width: '40px', padding: '5px', textAlign: 'center' }}>
        {username}
      </div>
    );
  };
export default UserItem;
