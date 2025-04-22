import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

import "./Navbar.css";
import logo from "../../assets/images/flow-logo.svg";
import { AddBusinessModal } from "../AddBusinessModal/AddBusinessModal";

export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const [problems, setProblems] = useState([]);
	const [newProblem, setNewProblem] = useState("");
	const username = store.user?.username || "User";
	const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

	const [newUser, setNewUser] = useState({
		username: "",
		password: "",
		confirmPassword: "",
		business_name: "",
		security_question: "",
		security_answer: "",
		role: "employee"
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState(""); 
	const [businesses, setBusinesses] = useState([]);

	useEffect(() => {
		const savedProblems = localStorage.getItem('problems');
		if (savedProblems) {
			setProblems(JSON.parse(savedProblems));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('problems', JSON.stringify(problems));
	}, [problems]);

	useEffect(() => {
		if (store.token) {
			const fetchBusinesses = async () => {
				try {
					const response = await fetch(`${backendUrl}api/businesses`, {
						headers: {
							'Authorization': `Bearer ${store.token}`
						}
					});

					if (response.ok) {
						const data = await response.json();
						setBusinesses(data);
					}
				} catch (error) {
					console.error("Error fetching businesses:", error);
				}
			};

			const newUserModal = document.getElementById('newUserModal');
			if (newUserModal) {
				newUserModal.addEventListener('show.bs.modal', () => {
					fetchBusinesses();
					// Clear messages when opening the modal
					setErrorMessage("");
					setSuccessMessage("");
				});

				return () => {
					newUserModal.removeEventListener('show.bs.modal', fetchBusinesses);
				};
			}
		}
	}, [store.token, backendUrl]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (newProblem.trim() !== "") {
			const problemWithTimestamp = {
				id: Date.now(),
				text: newProblem,
				date: new Date().toLocaleString()
			};
			setProblems([...problems, problemWithTimestamp]);
			setNewProblem("");
		}
	};

	const deleteProblem = (id) => {
		setProblems(problems.filter(problem => problem.id !== id));
	};

	const handleLogout = () => {
		dispatch({ type: "logout" })
		navigate("/")
	}

	const handleNewUserChange = (e) => {
		const { name, value } = e.target;
		setNewUser({
			...newUser,
			[name]: value
		});
	};

	const handleNewUserSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage("");
		setSuccessMessage("");

		if (newUser.password !== newUser.confirmPassword) {
			setErrorMessage("Passwords do not match");
			return;
		}

		try {
			const selectedBusiness = businesses.find(business => business.name === newUser.business_name);

			if (!selectedBusiness) {
				setErrorMessage("Business not found. Please select a valid business.");
				return;
			}

			const userData = {
				username: newUser.username,
				password: newUser.password,
				business_tax_id: selectedBusiness.tax_id,
				security_question: newUser.security_question,
				security_answer: newUser.security_answer,
				role: newUser.role
			};

			const response = await fetch(`${backendUrl}api/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${store.token}`
				},
				body: JSON.stringify(userData)
			});

			const data = await response.json();

			if (!response.ok) {
				setErrorMessage(data.error || "Error creating user");
				return;
			}

			console.log("User created:", data);

			setSuccessMessage(`User ${newUser.username} created successfully!`);

			setTimeout(() => {
				setNewUser({
					username: "",
					password: "",
					confirmPassword: "",
					business_name: "",
					security_question: "",
					security_answer: "",
					role: "employee"
				});

				setTimeout(() => {
					document.getElementById('closeNewUserModal').click();
				}, 1500);
			}, 500);

		} catch (error) {
			console.error("Error:", error);
			setErrorMessage("Connection error with server");
		}
	};

	return (
		<>
			<div className="navbar-container">
				<div className="top-navbar">
					<div className="logo-container">
						<img src={logo} alt="Flow Logo" className="navbar-logo" />
					</div>

					<div className="navbar-controls">

						{store.token && (
							<button className="btn-report" data-bs-toggle="modal" data-bs-target="#problemsModal">
								<i className="bi bi-exclamation-triangle"></i>
								<span>Report</span>
							</button>
						)}

						{store.token && (
							<div className="user-dropdown">
								<button className="btn-user dropdown-toggle" data-bs-toggle="dropdown">
									<i className="bi bi-person-circle"></i>
									<span>{username}</span>
								</button>
								<ul className="dropdown-menu dropdown-menu-end">
									<li><span className="dropdown-item user-name">{username}</span></li>
									<li><hr className="dropdown-divider" /></li>
									<li>
										<button
											className="dropdown-item"
											data-bs-toggle="modal"
											data-bs-target="#newUserModal"
										>
											<i className="bi bi-person-plus"></i> Create User
										</button>
									</li>
									<li>
										<button
											className="dropdown-item"
											data-bs-toggle="modal"
											data-bs-target="#newBusinessModal"
										>
											<i className="bi bi-building-plus"></i> Add business
										</button>
									</li>
									<li>
										<button
											className="dropdown-item logout"
											onClick={handleLogout}
										>
											Logout
										</button>
									</li>
								</ul>
							</div>
						)}
					</div>
				</div>

				<div className="modal fade" id="problemsModal" tabIndex="-1" aria-labelledby="problemsModalLabel" aria-hidden="true">
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="problemsModalLabel">
									<i className="bi bi-exclamation-triangle"></i> Report problem
								</h5>
								<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
							</div>
							<div className="modal-body">
								<form onSubmit={handleSubmit}>
									<div className="form-group mb-3">
										<label htmlFor="problemDescription" className="form-label">Problem description</label>
										<textarea
											id="problemDescription"
											className="form-control"
											placeholder="Describe the problem in detail..."
											value={newProblem}
											onChange={(e) => setNewProblem(e.target.value)}
											rows="3"
											required
										></textarea>
									</div>
									<div className="d-grid">
										<button type="submit" className="btn-submit">
											<i className="bi bi-plus-circle"></i> Register problem
										</button>
									</div>
								</form>

								{problems.length > 0 && (
									<div className="problems-list mt-4">
										<h6 className="list-title">Recent problems</h6>
										{problems.slice().reverse().map((problem) => (
											<div key={problem.id} className="problem-card">
												<div className="problem-header">
													<span className="problem-date">{problem.date}</span>
													<button
														className="btn-delete"
														onClick={() => deleteProblem(problem.id)}
														title="Delete"
													>
														<i className="bi bi-x"></i>
													</button>
												</div>
												<div className="problem-text">
													{problem.text}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="modal fade" id="newUserModal" tabIndex="-1" aria-labelledby="newUserModalLabel" aria-hidden="true">
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="newUserModalLabel">
									<i className="bi bi-person-plus"></i> Create New User
								</h5>
								<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeNewUserModal"></button>
							</div>
							<div className="modal-body">
								{successMessage && (
									<div className="alert alert-success mb-3" role="alert">
										<i className="bi bi-check-circle-fill me-2"></i>
										{successMessage}
									</div>
								)}

								<form onSubmit={handleNewUserSubmit}>
									<div className="form-group mb-3">
										<label htmlFor="username" className="form-label">Username</label>
										<input
											type="text"
											id="username"
											name="username"
											className="form-control"
											placeholder="Username"
											value={newUser.username}
											onChange={handleNewUserChange}
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label htmlFor="password" className="form-label">Password</label>
										<input
											type="password"
											id="password"
											name="password"
											className="form-control"
											placeholder="Password"
											value={newUser.password}
											onChange={handleNewUserChange}
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
										<input
											type="password"
											id="confirmPassword"
											name="confirmPassword"
											className="form-control"
											placeholder="Confirm your password"
											value={newUser.confirmPassword}
											onChange={handleNewUserChange}
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label htmlFor="business_name" className="form-label">Business Name</label>
										{businesses.length > 0 ? (
											<select
												id="business_name"
												name="business_name"
												className="form-select"
												value={newUser.business_name}
												onChange={handleNewUserChange}
												required
											>
												<option value="">Select a business</option>
												{businesses.map(business => (
													<option key={business.id} value={business.name}>
														{business.name}
													</option>
												))}
											</select>
										) : (
											<input
												type="text"
												id="business_name"
												name="business_name"
												className="form-control"
												placeholder="Business name"
												value={newUser.business_name}
												onChange={handleNewUserChange}
												required
											/>
										)}
									</div>

									<div className="form-group mb-3">
										<label htmlFor="security_question" className="form-label">Security Question</label>
										<input
											type="text"
											id="security_question"
											name="security_question"
											className="form-control"
											placeholder="Security question"
											value={newUser.security_question}
											onChange={handleNewUserChange}
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label htmlFor="security_answer" className="form-label">Security Answer</label>
										<input
											type="text"
											id="security_answer"
											name="security_answer"
											className="form-control"
											placeholder="Answer to security question"
											value={newUser.security_answer}
											onChange={handleNewUserChange}
											required
										/>
									</div>

									<div className="form-group mb-3">
										<label htmlFor="role" className="form-label">Role</label>
										<select
											id="role"
											name="role"
											className="form-select"
											value={newUser.role}
											onChange={handleNewUserChange}
											required
										>
											<option value="employee">Employee</option>
											<option value="manager">Manager</option>
											<option value="master">Administrator</option>
										</select>
									</div>

									{errorMessage && (
										<div className="alert alert-danger" role="alert">
											<i className="bi bi-exclamation-triangle-fill me-2"></i>
											{errorMessage}
										</div>
									)}
									<div className="d-grid mt-4">
										<button type="submit" className="btn-submit">
											<i className="bi bi-person-plus"></i> Create User
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={`sub-navigation-container ${store.token ? 'visible' : ''}`}>
				<div className="sub-navigation">
					<div className="container-fluid">
						<div className="row justify-content-center my-2">
							<div className="col-lg-2 col-md-4 col-sm-4 col-6 mb-2">
								<Link to="/clients" className="nav-button btn-clients">
									<i className="fa-solid fa-circle-user"></i>
									<span>CLIENTS</span>
								</Link>
							</div>
							<div className="col-lg-2 col-md-4 col-sm-4 col-6 mb-2">
								<Link to="/newclient" className="nav-button btn-new-client">
									<div>
										<i className="fa-solid fa-plus"></i>
										<i className="fa-solid fa-circle-user"></i>
									</div>
									<span>NEW CLIENT</span>
								</Link>
							</div>
							<div className="col-lg-2 col-md-4 col-sm-4 col-6 mb-2">
								<Link to="/appointments" className="nav-button btn-appointments">
									<i className="fa-solid fa-calendar-check"></i>
									<span>APPOINTMENTS</span>
								</Link>
							</div>
							<div className="col-lg-2 col-md-4 col-sm-4 col-6 mb-2">
								<Link to="/calendar" className="nav-button btn-calendar">
									<i className="fa-solid fa-calendar"></i>
									<span>CALENDAR</span>
								</Link>
							</div>
							<div className="col-lg-2 col-md-4 col-sm-4 col-6 mb-2">
								<Link to="/business" className="nav-button btn-business">
									<i className="fa-solid fa-building"></i>
									<span>BUSINESS</span>
								</Link>
							</div>
							<div className="col-lg-2 col-md-4 col-sm-4 col-6 mb-2">
								<Link to="/services" className="nav-button btn-services">
									<i className="fa-solid fa-paperclip"></i>
									<span>SERVICES</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			<AddBusinessModal />
		</>
	);
};