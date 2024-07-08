// "create a basic CRUD application that saves records to a local folder,
// accesses them, and performs CRUD operations using the file as storage."
import axios from "axios";
import { Suspense, useEffect, useState } from "react";

export interface PostsType {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export default function Home() {
    const [data, setData] = useState<PostsType[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [postsPerPage] = useState<number>(10);
    const [creatingNew, setCreatingNew] = useState<boolean>(false);
    const [details, setDetails] = useState<PostsType>({
        userId: 0,
        id: 0,
        title: "",
        body: "",
    });

    const fetchData = () => {
        axios
            .get("/api/posts")
            .then((res) => {
                setData(res.data);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (post: PostsType) => {
        setDetails(post);
        setShowModal(true);
        setCreatingNew(false);
    };

    const handleDelete = (id: number) => {
        axios
            .delete(`/api/posts/${id}`)
            .then((res) => {
                setData(data.filter((item) => item.id !== id));
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleCreateNew = () => {
        setDetails({ userId: 0, id: 0, title: "", body: "" });
        setShowModal(true);
        setCreatingNew(true);
    };

    const handleSubmit = () => {
        if (creatingNew) {
            axios
                .post(`/api/posts`, details)
                .then((res) => {
                    setShowModal(false);
                    fetchData();
                })
                .catch((e) => {
                    console.log(e);
                });
        } else {
            axios
                .put(`/api/posts/${details.id}`, details)
                .then((res) => {
                    setShowModal(false);
                    fetchData();
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = data.slice(indexOfFirstPost, indexOfLastPost);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data.length / postsPerPage); i++) {
        pageNumbers.push(i);
    }

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => (prevPage < pageNumbers.length ? prevPage + 1 : prevPage));
    };

    return (
        <>
            <div className="flex flex-col gap-4 p-6">
                <div className="flex justify-end">
                    <button
                        onClick={handleCreateNew}
                        className={`text-white px-4 py-2 
                          border-solid border-[2px] 
                          border-blue-700 bg-blue-700 
                          hover:bg-blue-500 hover:border-blue-500 
                          rounded-md`}
                    >
                        Create New Post
                    </button>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="flex flex-wrap justify-center">
                        {currentPosts?.map(({ id, title, body }: PostsType) => (
                            <div className="flex gap-4 p-6 border max-w-[90vw]" key={id}>
                                <p className="">{id}</p>
                                <p className="w-[35vw] max-w-[35vw]  break-words">{title}</p>
                                <p className="w-[35vw] max-w-[35vw]  break-words">{body}</p>
                                <div className="flex gap-2 items-start flex-wrap">
                                    <button
                                        className="hover:bg-slate-200 py-2 px-3 rounded-md"
                                        onClick={() => handleEdit({ id, title, body, userId: 0 })}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-700 hover:bg-slate-200 py-2 px-3 rounded-md"
                                        onClick={() => handleDelete(id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Suspense>
                <div className="pagination flex justify-center items-center">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="hover:bg-slate-200 px-2 rounded-full cursor-pointer"
                    >
                        &lt;
                    </button>
                    <span className="p-4">
                        {currentPage} of {pageNumbers.length}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === pageNumbers.length}
                        className="hover:bg-slate-200 px-2 rounded-full cursor-pointer"
                    >
                        &gt;
                    </button>
                </div>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="input-group">
                            <label htmlFor="title">Title:</label>
                            <input type="text" name="title" value={details.title} onChange={handleInputChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="body">Body:</label>
                            <textarea name="body" value={details.body} onChange={handleInputChange} />
                        </div>

                        <div className="modal-content-cta">
                            <button onClick={handleSubmit}>Save</button>
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
