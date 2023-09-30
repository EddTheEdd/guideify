"use client";
import axios from "axios";
import Link from "next/link";
import {toast} from "react-hot-toast";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";

export default function UserProfile({params}: any) {
    console.log(params);
    const router = useRouter();
    const logout = async () => {
        try {
            await axios.get('/api/users/logout');
            toast.success('Lougout successful');
            router.push('/login');
        } catch (error:any) {
            console.log(error.message);
            toast.error(error.message);
        }
    }
    return (
        <Layout>
            <div>
                <h1>Profile</h1>
                <p>Profile for {params.id}</p>
                <button onClick={logout}>Log out</button>
            </div>
        </Layout>
    )
}