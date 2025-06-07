import Nav from "../../Components/Nav_phong";

function Staff() {
    return (
        <div className='grid grid-cols-5'>
            <Nav />
            <main className='col-span-4 bg-red-400'>
                main content
            </main>

        </div>
    )
}

export default Staff;