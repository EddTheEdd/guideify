"use client";
import axios from "axios";
import Link from "next/link";
import {toast} from "react-hot-toast";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Layout from "../../components/Layout";

export default function ProfilePage({params}: any) {
    const router = useRouter();
    const [data, setData] = useState("nothing");
    const logout = async () => {
        try {
            await axios.get('/api/users/logout');
            toast.success('Lougout successful');
            router.push('/login');
            console.log(22);
        } catch (error:any) {
            console.log(error.message);
            toast.error(error.message);
        }
    }

    const getUserDetails = async () => {
        console.log("HIIII");
        const res = await axios.get('api/users/me');
        console.log(res.data);
        setData(res.data.data.id);
    }

    return (
        <Layout>
            <div>
                <h1>Profile</h1>
                <h2>{data === "nothing" ? "Nothing" : <Link href={`/profile/${data}`}>See profile</Link>}</h2>
                <p>Profile for {data}</p>
                <button onClick={logout}>Log out</button>

                <button onClick={getUserDetails}>Get User Details</button>
            </div>
        </Layout>
    )
}