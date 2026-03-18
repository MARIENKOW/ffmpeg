'use client'

import styles from './Loading.module.scss'
import { CircularProgress } from '@mui/material';

const Loading = ()=>{

   return(
      <section className={styles.wrapper}>
         <CircularProgress/>
      </section>
   )
}

export default Loading