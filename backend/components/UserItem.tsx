import { useDrag } from "react-dnd";

const UserItem: React.FC<any> = ({ id, username, currentRole, color }) => {
    const [, ref] = useDrag({
      type: "USER",
      item: { id, currentRole },
    });
  
    const borderStyle = `solid 2px ${color}`;

    return (
      <div ref={ref} style={{ overflow: "hidden", border: borderStyle, borderRadius: '5px', marginTop: '5px', minWidth: "40px", maxWidth: "80px", padding: '5px', textAlign: 'center' }}>
        {username}
      </div>
    );
  };
export default UserItem;
