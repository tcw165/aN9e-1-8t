import axios, { Axios } from "axios";
import { Container } from "inversify";
import 'reflect-metadata';
import AllocationRepo from './src/allocation_repo';
import { DepKeys } from "./types/dependency_keys";
import { IAllocationRepo } from './types/i_repo';

const app_dep_container = new Container();
app_dep_container.bind<Axios>(DepKeys.HttpClient)
  .toDynamicValue((context) => {
    console.log(context);
    console.log(`api_base_url: ${process.env.CLIENT_API_BASE_URL}`);

    return axios.create({
      baseURL: process.env.CLIENT_API_BASE_URL,
      timeout: 1000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
  })
  .inSingletonScope();
// app_dep_container.bind<IAllocationApi>(DepKeys.Api)
//   .to(AllocationApi)
//   .inSingletonScope();
app_dep_container.bind<IAllocationRepo>(DepKeys.AllocationRepo)
  .to(AllocationRepo)
  .inSingletonScope();

export { app_dep_container };
