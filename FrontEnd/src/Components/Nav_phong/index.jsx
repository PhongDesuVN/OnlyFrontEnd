import { BiHomeAlt } from 'react-icons/bi';


const Index = () => {
    return (
        <nav className='col-span-1 bg-blue-400'>
            <div className='p-4'>
                <h2 className=' font-bold text-white text-lg border-b border-black-500 text-right'>List</h2>
            </div>
            <ul>
                <li className='flex p-2 justify-end items-center bg-blue-600 text-white'>
                    <h2>Home</h2>
                    <BiHomeAlt size='1.875rem' />
                </li>
                <li><a href='#'>About</a></li>
                <li><a href='#'>Contact</a></li>
            </ul>
        </nav>
    );
};
export default Index;