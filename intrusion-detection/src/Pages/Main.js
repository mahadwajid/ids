import Navbar from "../Components/Navbar";
import Left from "./Left";
import Right from "./Right";

function Main(){
    return(
        <div style={{ display: "flex" }}>
        <Navbar />
        <Left />
        <div style={{ marginLeft: "200px", width: "100%" }}>
          <Right />
        </div>
      </div>
    )
}
export default Main;