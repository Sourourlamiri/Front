import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './sideBar.css';

const SideBar = () => {
 

  return (
    <div>
      <nav className="sidebar-nav scroll-sidebar" data-simplebar>
          <ul id="sidebarnav">
          <Link href="./index.html" className="text-nowrap logo-img text-center d-block py-3 w-100">
          <img src="../assets/images/logos/logo.jpg" width={120}alt="logo" />
                    </Link>
            <li className="nav-small-cap">
              <i className="ti ti-dots nav-small-cap-icon fs-6" />
              <span className="hide-menu">Accueil</span>
            </li>
            <li className="sidebar-item">
              <Link className="sidebar-link" href="./index.html" aria-expanded="false">



                <span>
                <iconify-icon icon="solar:home-smile-bold-duotone" className="fs-6" />
                </span>
                <span className="hide-menu">Dashboard</span>
              </Link>
             
            </li>


            <li className="nav-small-cap">
              <i className="ti ti-dots nav-small-cap-icon fs-6" />
              <span className="hide-menu">Listes</span>
            </li>





            <li className="sidebar-item">
              <Link className="sidebar-link"  to="/listRecruteurs" aria-expanded="false">
                <span>
                  <iconify-icon icon="bi:person-lines-fill" className="fs-6" />
                </span>
                <span className="hide-menu">Recruteurs</span>
              </Link>
            </li>



            <li className="sidebar-item">
              <Link className="sidebar-link" to="/listCandidats" aria-expanded="false">
                <span>
                  <iconify-icon icon="bi:person-lines-fill" className="fs-6" />
                </span>
                <span className="hide-menu">Candidats</span>
              </Link>
            </li>
          </ul>
          <div className="unlimited-access hide-menu  position-relative mb-7 mt-7 rounded-3"> 
          </div>
        </nav>
    </div>
  )
}
export default SideBar
