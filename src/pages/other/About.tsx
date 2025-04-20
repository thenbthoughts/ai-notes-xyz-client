const About = () => {
    return (
        <div className="p-2 lg:p-10">
            <div
                style={{
                    maxWidth: '750px',
                    margin: '0 auto'
                }}
            >
                <div className="bg-gray-100 container mx-auto rounded">
                    <div className="max-w-[600px] p-8 font-sans mx-auto">
                        <h1 className="text-3xl font-bold mb-4 text-blue-600">About This Task Notes App</h1>
                        <p className="mb-4">
                            This application is designed to help users manage their tasks and notes efficiently.
                            With a user-friendly interface, you can easily add, edit, and delete your tasks.
                        </p>
                        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Features</h2>
                        <ul className="list-disc list-inside mb-4">
                            <li className="mb-1">Organize your tasks with categories</li>
                            <li className="mb-1">Set deadlines and reminders</li>
                            <li className="mb-1">Track your progress with a visual dashboard</li>
                            <li className="mb-1">Collaborate with others on shared tasks</li>
                            <li className="mb-1">Access your notes offline</li>
                        </ul>
                        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Future Enhancements</h2>
                        <p className="mb-4">
                            We are continuously working on improving the app by adding new features such as
                            AI-generated suggestions for tasks, enhanced search capabilities, and more.
                        </p>
                        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Get Involved</h2>
                        <p className="">
                            We welcome contributions! If you have ideas or suggestions, feel free to reach out
                            or submit a pull request on our GitHub repository.
                        </p>
                        <h2 className="text-2xl font-semibold mt-6 mb-2 text-blue-600">Created By</h2>
                        <p className="mb-4">This app was created by NB.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
