import React from 'react'
import SideBar from '../../componentsRecruteur/sideBarR'
import Header from '../../componentsRecruteur/header'
import Footer from '../../componentsRecruteur/footer'
import { Outlet } from 'react-router-dom'

const Homerecruteur = () => {
  return (
   <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full" data-sidebar-position="fixed" data-header-position="fixed">
  {/* Sidebar Start */}
  <aside className="left-sidebar">
    {/* Sidebar scroll*/}
    <div>
      <div className="brand-logo d-flex align-items-center justify-content-between">
        <a href="./index.html" className="text-nowrap logo-img">
       
        </a>
        <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
          <i className="ti ti-x fs-8" />
        </div>
      </div>
      {/* Sidebar navigation*/}
      
      <SideBar/>


      {/* End Sidebar navigation */}
    </div>
    {/* End Sidebar scroll*/}
  </aside>
  {/*  Sidebar End */}
  {/*  Main wrapper */}
  <div className="body-wrapper">
    {/*  Header Start */}
    <Header/>

    {/*  Header End */}
    <div className="container-fluid">
      <div className="row">
        <Outlet/>
       <Footer/>
      </div>
    </div>
  </div>
</div>

  )
}

export default Homerecruteur
